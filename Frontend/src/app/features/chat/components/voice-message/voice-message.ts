import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import WaveSurfer from 'wavesurfer.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-voice-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-message.html',
  styleUrls: ['./voice-message.scss']
})
export class VoiceMessageComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) audioUrl!: string;
  @Input() audioDuration?: string;
  @Input() sender: string = 'me';

  @ViewChild('waveform', { static: false }) waveformContainer!: ElementRef;

  private wavesurfer: WaveSurfer | null = null;

  isPlaying = signal(false);
  playbackSpeed = signal(1); // 1x, 1.5x, 2x
  isEarpiece = signal(false);
  isReady = signal(false);
  loadedUrl: string | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    if (this.waveformContainer && this.audioUrl) {
      this.initWaveSurfer();
    }
  }

  ngOnDestroy(): void {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    if (this.loadedUrl && this.loadedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.loadedUrl);
    }
  }

  private async fetchAndCacheAudio(url: string): Promise<string> {
    // If it's already a data URI or blob URL, use it directly
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    try {
      // Download the audio file as a Blob to cache locally
      const blob = await this.http.get(url, { responseType: 'blob' }).toPromise();
      if (!blob) throw new Error('Blob empty');
      this.loadedUrl = URL.createObjectURL(blob);
      return this.loadedUrl;
    } catch (err) {
      console.warn('Failed to fetch audio for caching locally, using direct url', err);
      return url;
    }
  }

  private async initWaveSurfer(): Promise<void> {
    const cachedUrl = await this.fetchAndCacheAudio(this.audioUrl);

    this.wavesurfer = WaveSurfer.create({
      container: this.waveformContainer.nativeElement,
      waveColor: this.sender === 'me' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(7, 137, 48, 0.4)',
      progressColor: this.sender === 'me' ? '#fff' : '#078930',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 30,
      url: cachedUrl,
    });

    this.wavesurfer.on('ready', () => {
      this.isReady.set(true);
      // Ensure Angular detects the change
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('play', () => {
      this.isPlaying.set(true);
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('pause', () => {
      this.isPlaying.set(false);
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('finish', () => {
      this.isPlaying.set(false);
      this.cdr.detectChanges();
    });
  }

  togglePlay(): void {
    if (!this.wavesurfer || !this.isReady()) return;
    this.wavesurfer.playPause();
  }

  toggleSpeed(): void {
    if (!this.wavesurfer) return;
    const currentSpeed = this.playbackSpeed();
    const newSpeed = currentSpeed === 1 ? 1.5 : currentSpeed === 1.5 ? 2 : 1;
    this.playbackSpeed.set(newSpeed);
    this.wavesurfer.setPlaybackRate(newSpeed);
  }

  toggleProximity(): void {
    // Note: Proximity sensor requires native mobile integration, standard browser APIs
    // do not have proximity sensors. For PWA or mobile emulation we can mock the toggle.
    this.isEarpiece.set(!this.isEarpiece());
    // Mute/adjust volume or route audio to ear piece if native plugins are used (e.g. Capacitor).
    // Here we just simulate reducing the volume.
    if (this.wavesurfer) {
      this.wavesurfer.setVolume(this.isEarpiece() ? 0.3 : 1.0);
    }
  }
}
