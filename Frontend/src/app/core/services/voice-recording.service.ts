import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VoiceRecordingService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private activeStream: MediaStream | null = null;
    private timerInterval: any = null;

    isRecording = signal(false);
    recordingSeconds = signal(0);
    finalDuration = signal('');

    async startRecording(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.activeStream = stream;
            this.audioChunks = [];
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };

            this.mediaRecorder.start();
            this.isRecording.set(true);
            this.recordingSeconds.set(0);

            this.timerInterval = setInterval(() => {
                this.recordingSeconds.update(s => s + 1);
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
            throw new Error('Microphone access is required to send voice messages. Please allow access.');
        }
    }

    stopRecording(): Promise<{ blob: Blob, duration: string, mimeType: string }> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject('No active recording');
                return;
            }

            const duration = this.formatTime(this.recordingSeconds());
            this.finalDuration.set(duration);

            this.mediaRecorder.onstop = () => {
                this.cleanupStream();
                const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
                const blob = new Blob(this.audioChunks, { type: mimeType });
                resolve({ blob, duration, mimeType });
            };

            this.mediaRecorder.stop();
            this.isRecording.set(false);
        });
    }

    cancelRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.ondataavailable = null;
            this.mediaRecorder.onstop = null;
            this.mediaRecorder.stop();
        }
        this.cleanupStream();
        this.isRecording.set(false);
        this.recordingSeconds.set(0);
        this.audioChunks = [];
    }

    private cleanupStream(): void {
        if (this.activeStream) {
            this.activeStream.getTracks().forEach(t => t.stop());
            this.activeStream = null;
        }
        clearInterval(this.timerInterval);
    }

    formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    uploadVoiceMessage(blob: Blob, fileName: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('discriminator', 'ChatVoice');
        // Using the requested /api/file/upload path
        return this.http.post(`${this.apiUrl}/file/upload`, formData);
    }
}
