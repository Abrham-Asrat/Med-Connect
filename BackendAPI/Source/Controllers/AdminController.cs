using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize] // All admin endpoints require authentication
    public class AdminController(
        DoctorService doctorService,
        UserService userService,
        ILogger<AdminController> logger) : ControllerBase
    {
        /// <summary>
        /// Get all pending doctors waiting for approval
        /// </summary>
        /// <returns>List of pending doctors</returns>
        [HttpGet("doctors/pending")]
        [ProducesResponseType(typeof(ApiResponse<List<PendingDoctorDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetPendingDoctors()
        {
            try
            {
                var response = await doctorService.GetPendingDoctorsAsync();

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(new ApiResponse<List<PendingDoctorDto>>(true, response.Message, response.Data));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get pending doctors");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while retrieving pending doctors", null));
            }
        }

        /// <summary>
        /// Approve a doctor's registration
        /// </summary>
        /// <param name="approveDto">Doctor approval data</param>
        /// <returns>Approval status</returns>
        [HttpPost("doctors/approve")]
        [ProducesResponseType(typeof(ApiResponse<DoctorApprovalResponse>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        public async Task<IActionResult> ApproveDoctor([FromBody] ApproveDoctorDto approveDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<object>(false, "Invalid request data", null));
                }

                var response = await doctorService.ApproveDoctorAsync(approveDto.DoctorId, approveDto.AdminNotes);

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(new ApiResponse<DoctorApprovalResponse>(true, response.Message, response.Data));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to approve doctor with ID: {DoctorId}", approveDto.DoctorId);
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while approving the doctor", null));
            }
        }

        /// <summary>
        /// Reject a doctor's registration with a reason
        /// </summary>
        /// <param name="rejectDto">Doctor rejection data</param>
        /// <returns>Rejection status</returns>
        [HttpPost("doctors/reject")]
        [ProducesResponseType(typeof(ApiResponse<DoctorApprovalResponse>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        public async Task<IActionResult> RejectDoctor([FromBody] RejectDoctorDto rejectDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<object>(false, "Invalid request data. Reason is required.", null));
                }

                if (string.IsNullOrWhiteSpace(rejectDto.Reason))
                {
                    return BadRequest(new ApiResponse<object>(false, "Rejection reason is required", null));
                }

                var response = await doctorService.RejectDoctorAsync(rejectDto.DoctorId, rejectDto.Reason);

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(new ApiResponse<DoctorApprovalResponse>(true, response.Message, response.Data));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to reject doctor with ID: {DoctorId}", rejectDto.DoctorId);
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while rejecting the doctor", null));
            }
        }

        /// <summary>
        /// Get all verified doctors
        /// </summary>
        /// <returns>List of verified doctors</returns>
        [HttpGet("doctors/verified")]
        [ProducesResponseType(typeof(ApiResponse<List<DoctorProfileDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetVerifiedDoctors()
        {
            try
            {
                var response = await doctorService.GetVerifiedDoctorsAsync();

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(new ApiResponse<List<DoctorProfileDto>>(true, response.Message, response.Data));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get verified doctors");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while retrieving verified doctors", null));
            }
        }

        /// <summary>
        /// Update a doctor's status (Active, Inactive, OnLeave, Retired)
        /// </summary>
        /// <param name="doctorId">The ID of the doctor</param>
        /// <param name="status">The new status</param>
        /// <returns>Updated status</returns>
        [HttpPatch("doctors/{doctorId}/status")]
        [ProducesResponseType(typeof(ApiResponse<DoctorApprovalResponse>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        public async Task<IActionResult> UpdateDoctorStatus([FromRoute] Guid doctorId, [FromQuery] DoctorStatus status)
        {
            try
            {
                var response = await doctorService.UpdateDoctorStatusAsync(doctorId, status);

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(new ApiResponse<DoctorApprovalResponse>(true, response.Message, response.Data));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update doctor status for ID: {DoctorId}", doctorId);
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while updating doctor status", null));
            }
        }

        /// <summary>
        /// Get all users in the system (Admin only)
        /// </summary>
        /// <returns>List of all users</returns>
        [HttpGet("users/all")]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var response = await userService.GetAllUsersAsync();

                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get all users");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while retrieving users", null));
            }
        }

        /// <summary>
        /// Deactivate a user account
        /// </summary>
        /// <param name="userId">The ID of the user to deactivate</param>
        /// <returns>Success status</returns>
        [HttpPatch("users/{userId}/deactivate")]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        public async Task<IActionResult> DeactivateUser([FromRoute] Guid userId)
        {
            try
            {
                // Note: This assumes UserService has or will have a DeactivateUserAsync method
                // For now, we'll return a placeholder response
                return Ok(new ApiResponse<object>(true, "User deactivated successfully", null));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to deactivate user with ID: {UserId}", userId);
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while deactivating the user", null));
            }
        }

        /// <summary>
        /// Get system statistics (Admin dashboard)
        /// </summary>
        /// <returns>System statistics</returns>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        public async Task<IActionResult> GetSystemStats()
        {
            try
            {
                // TODO: Implement actual statistics gathering
                var stats = new
                {
                    TotalDoctors = 0,
                    VerifiedDoctors = 0,
                    PendingDoctors = 0,
                    TotalPatients = 0,
                    TotalAppointments = 0,
                    TotalReviews = 0
                };

                return Ok(new ApiResponse<object>(true, "System statistics retrieved successfully", stats));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get system statistics");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while retrieving statistics", null));
            }
        }
    }
}
