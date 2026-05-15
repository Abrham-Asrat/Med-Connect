using BackendAPI.Source.Service.ReviewService;
using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Helpers.Default;

[ApiController]
[Route("api/reviews")]
public class ReviewController(IReviewService reviewService, ILogger<ReviewController> logger)
  : ControllerBase
{
  /// <summary>
  /// Create a review using UserId values (resolves DoctorId and PatientId internally).
  /// This is the endpoint used by the chat component after a consultation closes.
  /// </summary>
  [HttpPost("by-user")]
  public async Task<IActionResult> PostReviewByUserId([FromBody] CreateReviewByUserIdDto dto)
  {
    if (dto == null || !ModelState.IsValid)
      return BadRequest(new ApiResponse<ReviewDto>(false, "Invalid review data", null));

    try
    {
      var review = await reviewService.CreateReviewByUserIdAsync(dto);
      return CreatedAtAction(nameof(GetReviewById), new { reviewId = review.ReviewId },
        new ApiResponse<ReviewDto>(true, "Review Created Successfully", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (InvalidOperationException ex)
    {
      logger.LogWarning(ex, "Business rule violation when creating review by user ID");
      return BadRequest(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to create review by user ID");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while creating the review", null));
    }
  }

  /// <summary>
  /// Create a new review (only patients can post reviews)
  /// </summary>
  /// <param name="createReviewDto">Review data</param>
  /// <returns>The created review</returns>
  [HttpPost]
  // [Authorize]
  public async Task<IActionResult> PostReview([FromBody] CreateReviewDto createReviewDto)
  {
    if (createReviewDto == null)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Review data is required", null));
    }
    
    if (!ModelState.IsValid)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Invalid review data", null));
    }
    
    try 
    {
      // For client credentials flow, we trust the patientId in the request body
      // For user tokens, we would validate against the token's subject
      var patientId = createReviewDto.PatientId;
      
      if (patientId == Guid.Empty)
      {
        return BadRequest(new ApiResponse<ReviewDto>(false, "Patient ID is required", null));
      }
      
      var review = await reviewService.CreateReviewAsync(createReviewDto);
      return CreatedAtAction(nameof(GetReviewById), new { reviewId = review.ReviewId },
        new ApiResponse<ReviewDto>(true, "Review Created Successfully", review)); 
    }
    catch (InvalidOperationException ex)
    {
      logger.LogWarning(ex, "Business rule violation when creating review");
      return BadRequest(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to create review");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while creating the review", null));
    }
  }

  /// <summary>
  /// Get all reviews
  /// </summary>
  /// <returns>List of reviews</returns>
  [HttpGet]
  public async Task<IActionResult> GetAllReviews()
  {
    try
    {
      var reviews = await reviewService.GetAllReviews();
      return Ok(new ApiResponse<ICollection<ReviewDto>>(true, "Reviews retrieved successfully", reviews));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get all reviews");
      return StatusCode(500, new ApiResponse<ICollection<ReviewDto>>(false, "An error occurred while retrieving reviews", null));
    }
  }

  /// <summary>
  /// Get review by ID
  /// </summary>
  /// <param name="reviewId">The ID of the review to retrieve</param>
  /// <returns>The review with the specified ID</returns>
  [HttpGet("{reviewId}")]
  public async Task<IActionResult> GetReviewById(Guid reviewId)
  {
    try
    {
      var review = await reviewService.GetReviewAsync(reviewId);
      return Ok(new ApiResponse<ReviewDto>(true, "Review retrieved successfully", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get review by ID: {ReviewId}", reviewId);
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while retrieving the review", null));
    }
  }

  /// <summary>
  /// Get all reviews for a specific doctor (doctor as viewer)
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>List of reviews for the doctor</returns>
  [HttpGet("doctor/{doctorId}")]
  public async Task<IActionResult> GetDoctorReviews(Guid doctorId)
  {
    try
    {
      var reviews = await reviewService.GetAllReviewsForDoctorAsync(doctorId);
      return Ok(new ApiResponse<ICollection<ReviewDto>>(true, "Doctor reviews retrieved successfully", reviews));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ICollection<ReviewDto>>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get doctor reviews: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<ICollection<ReviewDto>>(false, "An error occurred while retrieving doctor reviews", null));
    }
  }

  /// <summary>
  /// Get all reviews posted by a specific patient (patient as poster)
  /// </summary>
  /// <param name="patientId">The ID of the patient</param>
  /// <returns>List of reviews posted by the patient</returns>
  [HttpGet("patient/{patientId}")]
  [Authorize]
  public async Task<IActionResult> GetPatientReviews(Guid patientId)
  {
    try
    {
      // For client credentials flow, allow fetching reviews for any patient
      // For user tokens, you would validate userId == patientId
      
      var reviews = await reviewService.GetAllReviewsForPatientAsync(patientId);
      return Ok(new ApiResponse<ICollection<ReviewDto>>(true, "Patient reviews retrieved successfully", reviews));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ICollection<ReviewDto>>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get patient reviews: {PatientId}", patientId);
      return StatusCode(500, new ApiResponse<ICollection<ReviewDto>>(false, "An error occurred while retrieving patient reviews", null));
    }
  }

  /// <summary>
  /// Edit a review (only the patient who posted it can edit)
  /// </summary>
  /// <param name="editReviewDto">Updated review data</param>
  /// <returns>The updated review</returns>
  [HttpPut]
  [Authorize]
  public async Task<IActionResult> EditReview([FromBody] EditReviewDto editReviewDto)
  {
    if (editReviewDto == null)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Review data is required", null));
    }
    
    if (!ModelState.IsValid)
    {
      return BadRequest(new ApiResponse<ReviewDto>(false, "Invalid review data", null));
    }
    
    try
    {
      
      var review = await reviewService.EditReviewAsync(editReviewDto);
      return Ok(new ApiResponse<ReviewDto>(true, "Review updated successfully", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to edit review");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "An error occurred while updating the review", null));
    }
  }

  /// <summary>
  /// Delete a review (only the patient who posted it can delete)
  /// </summary>
  /// <param name="reviewId">The ID of the review to delete</param>
  /// <returns>No content on success</returns>
  [HttpDelete("{reviewId}")]
  [Authorize]
  public async Task<IActionResult> DeleteReview(Guid reviewId)
  {
    try
    {
      
      await reviewService.DeleteReviewAsync(reviewId);
      return NoContent();
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<object>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to delete review: {ReviewId}", reviewId);
      return StatusCode(500, new ApiResponse<object>(false, "An error occurred while deleting the review", null));
    }
  }

  /// <summary>
  /// Get review statistics for a doctor
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>Doctor review statistics</returns>
  [HttpGet("doctor/{doctorId}/stats")]
  public async Task<IActionResult> GetDoctorReviewStats(Guid doctorId)
  {
    try
    {
      var stats = await reviewService.GetDoctorReviewStatsAsync(doctorId);
      return Ok(new ApiResponse<DoctorReviewStatsDto>(true, "Doctor review statistics retrieved successfully", stats));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<DoctorReviewStatsDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get doctor review stats: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<DoctorReviewStatsDto>(false, "An error occurred while retrieving doctor review statistics", null));
    }
  }

  /// <summary>
  /// Get review history for a patient
  /// </summary>
  /// <param name="patientId">The ID of the patient</param>
  /// <returns>Patient review history</returns>
  [HttpGet("patient/{patientId}/history")]
  [Authorize]
  public async Task<IActionResult> GetPatientReviewHistory(Guid patientId)
  {
    try
    {
      // For client credentials flow, allow fetching history for any patient
      // For user tokens, you would validate userId == patientId
      
      var history = await reviewService.GetPatientReviewHistoryAsync(patientId);
      return Ok(new ApiResponse<PatientReviewHistoryDto>(true, "Patient review history retrieved successfully", history));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<PatientReviewHistoryDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get patient review history: {PatientId}", patientId);
      return StatusCode(500, new ApiResponse<PatientReviewHistoryDto>(false, "An error occurred while retrieving patient review history", null));
    }
  }

  /// <summary>
  /// Search and filter reviews
  /// </summary>
  /// <param name="searchDto">Search criteria</param>
  /// <returns>Filtered collection of reviews</returns>
  [HttpGet("search")]
  public async Task<IActionResult> SearchReviews([FromQuery] ReviewSearchDto searchDto)
  {
    try
    {
      var reviews = await reviewService.SearchReviewsAsync(searchDto);
      return Ok(new ApiResponse<ICollection<ReviewSummaryDto>>(true, "Reviews search completed successfully", reviews));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to search reviews");
      return StatusCode(500, new ApiResponse<ICollection<ReviewSummaryDto>>(false, "An error occurred while searching reviews", null));
    }
  }

  /// <summary>
  /// Get recent reviews for a doctor
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <param name="count">Number of recent reviews to return (default: 5)</param>
  /// <returns>Collection of recent reviews</returns>
  [HttpGet("doctor/{doctorId}/recent")]
  public async Task<IActionResult> GetRecentReviewsForDoctor(Guid doctorId, [FromQuery] int count = 5)
  {
    try
    {
      if (count <= 0 || count > 20)
      {
        return BadRequest(new ApiResponse<ICollection<ReviewSummaryDto>>(false, "Count must be between 1 and 20", null));
      }
      
      var reviews = await reviewService.GetRecentReviewsForDoctorAsync(doctorId, count);
      return Ok(new ApiResponse<ICollection<ReviewSummaryDto>>(true, "Recent reviews retrieved successfully", reviews));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ICollection<ReviewSummaryDto>>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get recent reviews for doctor: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<ICollection<ReviewSummaryDto>>(false, "An error occurred while retrieving recent reviews", null));
    }
  }

  /// <summary>
  /// Check if a patient has already reviewed a doctor
  /// </summary>
  /// <param name="patientId">The ID of the patient</param>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>True if review exists, false otherwise</returns>
  [HttpGet("check/{patientId}/{doctorId}")]
  [Authorize]
  public async Task<IActionResult> CheckIfPatientReviewedDoctor(Guid patientId, Guid doctorId)
  {
    try
    {
      // For client credentials flow, allow checking for any patient
      // For user tokens, you would validate userId == patientId
      
      var hasReviewed = await reviewService.HasPatientReviewedDoctorAsync(patientId, doctorId);
      return Ok(new ApiResponse<bool>(true, "Review status checked successfully", hasReviewed));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to check if patient reviewed doctor: {PatientId}, {DoctorId}", patientId, doctorId);
      return StatusCode(500, new ApiResponse<bool>(false, "An error occurred while checking review status", false));
    }
  }

  /// <summary>
  /// Get the average rating for a doctor
  /// </summary>
  /// <param name="doctorId">The ID of the doctor</param>
  /// <returns>Average rating (0 if no reviews)</returns>
  [HttpGet("doctor/{doctorId}/average-rating")]
  public async Task<IActionResult> GetDoctorAverageRating(Guid doctorId)
  {
    try
    {
      var averageRating = await reviewService.GetDoctorAverageRatingAsync(doctorId);
      return Ok(new ApiResponse<decimal>(true, "Doctor average rating retrieved successfully", averageRating));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<decimal>(false, ex.Message, 0));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to get doctor average rating: {DoctorId}", doctorId);
      return StatusCode(500, new ApiResponse<decimal>(false, "An error occurred while retrieving doctor average rating", 0));
    }
  }

  /// <summary>
  /// Mark a review as helpful (like)
  /// </summary>
  /// <param name="reviewId">The ID of the review</param>
  [HttpPost("{reviewId}/helpful")]
  public async Task<IActionResult> MarkAsHelpful(Guid reviewId)
  {
    try
    {
      var review = await reviewService.MarkReviewAsHelpfulAsync(reviewId);
      return Ok(new ApiResponse<ReviewDto>(true, "Review marked as helpful", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to mark review as helpful");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "Error marking review as helpful", null));
    }
  }

  /// <summary>
  /// Reply to a review (Doctor only)
  /// </summary>
  /// <param name="replyDto">Reply data</param>
  [HttpPost("reply")]
  // [Authorize(Roles = "Doctor")]
  public async Task<IActionResult> ReplyToReview([FromBody] ReplyReviewDto replyDto)
  {
    if (replyDto == null || !ModelState.IsValid)
      return BadRequest(new ApiResponse<ReviewDto>(false, "Invalid reply data", null));

    try
    {
      var review = await reviewService.ReplyToReviewAsync(replyDto);
      return Ok(new ApiResponse<ReviewDto>(true, "Reply posted successfully", review));
    }
    catch (KeyNotFoundException ex)
    {
      return NotFound(new ApiResponse<ReviewDto>(false, ex.Message, null));
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to reply to review");
      return StatusCode(500, new ApiResponse<ReviewDto>(false, "Error posting reply", null));
    }
  }
}
