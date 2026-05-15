using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Attributes;

namespace BackendAPI.Source.Models.Entities
{

/// <summary>
/// Review entity representing a patient's review of a doctor
/// Patient is the review poster, Doctor is the review viewer
/// </summary>
public class ReviewModel : BaseEntity
{
  /// <summary>
  /// Unique identifier for the review
  /// </summary>
  public Guid ReviewId { get; set; } = Guid.NewGuid();

  /// <summary>
  /// Foreign key to the Doctor being reviewed (viewer)
  /// </summary>
  [Required]
  public Guid DoctorId { get; set; }

  /// <summary>
  /// Foreign key to the Patient posting the review (poster)
  /// </summary>
  [Required]
  public Guid PatientId { get; set; }

  /// <summary>
  /// Star rating given by the patient (0-5 stars)
  /// </summary>
  [Required]
  [StarRating]
  [Range(0, 5)]
  public decimal StarRating { get; set; }

  /// <summary>
  /// Text content of the review
  /// </summary>
  [Required]
  [MinLength(10, ErrorMessage = "Review text must be at least 10 characters long")]
  [MaxLength(1000, ErrorMessage = "Review text cannot exceed 1000 characters")]
  public required string ReviewText { get; set; }

  /// <summary>
  /// Tracks how many other users found this review helpful. Used for sorting public profiles.
  /// </summary>
  public int HelpfulCount { get; set; } = 0;

  /// <summary>
  /// Determines if the review is broadcasted to the public doctor profile, or retained purely for internal clinic moderation and privately visible only to the admin/doctor. (e.g. 1-3 star reviews).
  /// </summary>
  public bool IsPublic { get; set; } = true;

  /// <summary>
  /// When the review was created
  /// </summary>
  public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  /// <summary>
  /// When the review was last updated (null if never updated)
  /// </summary>
  public new DateTime? UpdatedAt { get; set; }

  /// <summary>
  /// Optional response from the doctor to the patient's review
  /// </summary>
  public string? ReplyText { get; set; }

  /// <summary>
  /// When the doctor replied to the review (null if never replied)
  /// </summary>
  public DateTime? RepliedAt { get; set; }

  // Moderation
  public bool IsFlagged { get; set; } = false;
  public string? FlagReason { get; set; }
  public string? FlaggedBy { get; set; }
  public DateTime? FlaggedAt { get; set; }

  // Navigation properties
  /// <summary>
  /// Navigation property to the Doctor being reviewed
  /// </summary>
  public virtual DoctorModel? Doctor { get; set; }

  /// <summary>
  /// Navigation property to the Patient who posted the review
  /// </summary>
  public virtual PatientModel? Patient { get; set; }

  /// <summary>
  /// Updates the review with new rating and text
  /// </summary>
  /// <param name="starRating">New star rating</param>
  /// <param name="reviewText">New review text</param>
  public void UpdateReview(decimal starRating, string reviewText)
  {
    StarRating = starRating;
    ReviewText = reviewText;
    UpdatedAt = DateTime.UtcNow;
  }

  /// <summary>
  /// Gets the full name of the patient who posted the review
  /// </summary>
  /// <returns>Patient's full name or empty string if not available</returns>
  public string GetPatientFullName()
  {
    return Patient?.User != null 
      ? $"{Patient.User.FirstName} {Patient.User.LastName}".Trim()
      : string.Empty;
  }

  /// <summary>
  /// Gets the full name of the doctor being reviewed
  /// </summary>
  /// <returns>Doctor's full name or empty string if not available</returns>
  public string GetDoctorFullName()
  {
    return Doctor?.User != null 
      ? $"{Doctor.User.FirstName} {Doctor.User.LastName}".Trim()
      : string.Empty;
  }

  /// <summary>
  /// Checks if the review has been updated since creation
  /// </summary>
  /// <returns>True if the review has been updated, false otherwise</returns>
  public bool HasBeenUpdated()
  {
    return UpdatedAt.HasValue && UpdatedAt.Value > CreatedAt;
  }
}
}