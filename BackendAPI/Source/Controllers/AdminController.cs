using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "AdminOnly")] // Only admins can access
    public class AdminController(
        ApplicationDbContext appContext,
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
                var response = await userService.DeactivateUserAsync(userId);
                
                if (!response.Success)
                {
                    return StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null));
                }
                
                return Ok(new ApiResponse<object>(true, response.Message, null));
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
        [ProducesResponseType(typeof(ApiResponse<object>), 403)]
        public async Task<IActionResult> GetSystemStats()
        {
            try
            {
                // Get total doctors count
                var totalDoctors = await appContext.Doctors.CountAsync();
                
                // Get verified doctors count
                var verifiedDoctors = await appContext.Doctors.CountAsync(d => d.IsVerified);
                
                // Get pending (unverified) doctors count
                var pendingDoctors = await appContext.Doctors.CountAsync(d => !d.IsVerified);
                
                // Get total patients count
                var totalPatients = await appContext.Patients.CountAsync();
                
                // Get total appointments count
                var totalAppointments = await appContext.Appointments.CountAsync();
                
                // Get total reviews count
                var totalReviews = await appContext.Reviews.CountAsync();
                
                // Get total users count
                var totalUsers = await appContext.Users.CountAsync();
                
                // Get appointments by status
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var upcomingAppointments = await appContext.Appointments
                    .CountAsync(a => a.AppointmentDate >= today);
                    
                var todaysAppointments = await appContext.Appointments
                    .CountAsync(a => a.AppointmentDate == today);
                
                // Get recent registrations (last 7 days)
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                var recentRegistrations = await appContext.Users
                    .CountAsync(u => u.CreatedAt >= sevenDaysAgo);
                
                var totalRevenue = await appContext.Payments
                    .Where(p => p.PaymentStatus == PaymentStatus.Success)
                    .SumAsync(p => p.Amount);
                
                var stats = new
                {
                    TotalDoctors = totalDoctors,
                    VerifiedDoctors = verifiedDoctors,
                    PendingDoctors = pendingDoctors,
                    TotalPatients = totalPatients,
                    TotalAppointments = totalAppointments,
                    TotalReviews = totalReviews,
                    TotalUsers = totalUsers,
                    TotalRevenue = totalRevenue,
                    UpcomingAppointments = upcomingAppointments,
                    TodaysAppointments = todaysAppointments,
                    RecentRegistrations = recentRegistrations
                };

                logger.LogInformation("Admin statistics retrieved successfully");
                return Ok(new ApiResponse<object>(true, "System statistics retrieved successfully", stats));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get system statistics");
                return StatusCode(500, new ApiResponse<object>(false, "An unexpected error occurred while retrieving statistics", null));
            }
        }

        [HttpGet("finance/analytics")]
        public async Task<IActionResult> GetFinancialAnalytics()
        {
            try
            {
                var payments = await appContext.Payments
                    .Include(p => p.Appointment)
                    .ThenInclude(a => a.Doctor)
                    .Include(p => p.Appointment)
                    .ThenInclude(a => a.Patient)
                    .ThenInclude(pa => pa.User)
                    .Where(p => p.PaymentStatus == PaymentStatus.Success)
                    .ToListAsync();
                
                var totalRevenue = payments.Sum(p => p.Amount);
                var thisMonthRevenue = payments.Where(p => p.PaymentDate.Month == DateTime.UtcNow.Month && p.PaymentDate.Year == DateTime.UtcNow.Year).Sum(p => p.Amount);
                
                var monthlyRevenue = payments
                    .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                    .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                    .Select(g => new { 
                        month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"), 
                        amount = g.Sum(p => p.Amount) 
                    })
                    .TakeLast(10)
                    .ToList();
                    
                var specialtyRevenue = payments
                    .Where(p => p.Appointment?.Doctor != null)
                    .Join(appContext.DoctorSpecialties.Include(ds => ds.Specialty), 
                          p => p.Appointment!.DoctorId, 
                          ds => ds.DoctorId, 
                          (p, ds) => new { p.Amount, SpecialtyName = ds.Specialty.Name })
                    .GroupBy(x => x.SpecialtyName)
                    .Select(g => new { specialty = g.Key, amount = g.Sum(x => x.Amount) })
                    .ToList();

                var recentTxns = payments
                    .OrderByDescending(p => p.PaymentDate)
                    .Take(10)
                    .Select(p => new {
                        id = p.TxRef,
                        doctor = p.Appointment?.Doctor?.User?.FirstName != null ? $"Dr. {p.Appointment.Doctor.User.FirstName} {p.Appointment.Doctor.User.LastName}" : "Unknown",
                        patient = p.Appointment?.Patient?.User?.FirstName != null ? $"{p.Appointment.Patient.User.FirstName} {p.Appointment.Patient.User.LastName}" : "Unknown",
                        amount = p.Amount,
                        date = p.PaymentDate.ToString("yyyy-MM-dd"),
                        status = p.PaymentStatus.ToString()
                    }).ToList();

                return Ok(new ApiResponse<object>(true, "Finance data loaded", new {
                    totalRevenue,
                    thisMonth = thisMonthRevenue,
                    monthlyRevenue,
                    revenueBySpecialty = specialtyRevenue,
                    transactions = recentTxns
                }));
            }
            catch (Exception ex)
            {
               logger.LogError(ex, "Failed to get finance data");
               return StatusCode(500, new ApiResponse<object>(false, "An error occurred", null));
            }
        }

        [HttpGet("moderation/flagged")]
        public async Task<IActionResult> GetFlaggedContent()
        {
            try
            {
                var flaggedBlogs = await appContext.Blogs
                    .Include(b => b.Author)
                    .Where(b => b.IsFlagged)
                    .Select(b => new {
                        id = b.BlogId.ToString(),
                        type = "blog",
                        title = b.Title,
                        authorName = b.Author != null ? b.Author.FirstName + " " + b.Author.LastName : "Unknown",
                        content = b.Content,
                        flaggedBy = b.FlaggedBy,
                        flagReason = b.FlagReason,
                        flaggedAt = b.FlaggedAt
                    }).ToListAsync();

                var flaggedReviews = await appContext.Reviews
                    .Include(r => r.Patient).ThenInclude(p => p.User)
                    .Include(r => r.Doctor).ThenInclude(d => d.User)
                    .Where(r => r.IsFlagged)
                    .Select(r => new {
                        id = r.ReviewId.ToString(),
                        type = "review",
                        text = r.ReviewText,
                        patientName = r.Patient != null && r.Patient.User != null ? r.Patient.User.FirstName + " " + r.Patient.User.LastName : "Unknown",
                        doctorName = r.Doctor != null && r.Doctor.User != null ? r.Doctor.User.FirstName + " " + r.Doctor.User.LastName : "Unknown",
                        rating = r.StarRating,
                        flaggedBy = r.FlaggedBy,
                        flagReason = r.FlagReason,
                        flaggedAt = r.FlaggedAt
                    }).ToListAsync();

                var result = flaggedBlogs.Cast<object>().Concat(flaggedReviews).ToList();
                return Ok(new ApiResponse<object>(true, "Flagged content loaded", result));
            }
            catch (Exception ex)
            {
               logger.LogError(ex, "Failed to get flagged content");
               return StatusCode(500, new ApiResponse<object>(false, "Server Error", null));
            }
        }

        [HttpPost("moderation/flagged/{type}/{id}/dismiss")]
        public async Task<IActionResult> DismissFlaggedContent(string type, Guid id)
        {
            if (type == "blog")
            {
                var blg = await appContext.Blogs.FindAsync(id);
                if (blg != null) { blg.IsFlagged = false; blg.FlagReason = null; await appContext.SaveChangesAsync(); }
            }
            else
            {
                var rev = await appContext.Reviews.FindAsync(id);
                if (rev != null) { rev.IsFlagged = false; rev.FlagReason = null; await appContext.SaveChangesAsync(); }
            }
            return Ok(new ApiResponse<object>(true, "Flag dismissed", null));
        }

        [HttpDelete("moderation/flagged/{type}/{id}/remove")]
        public async Task<IActionResult> RemoveFlaggedContent(string type, Guid id)
        {
            if (type == "blog")
            {
                var blg = await appContext.Blogs.FindAsync(id);
                if (blg != null) { appContext.Blogs.Remove(blg); await appContext.SaveChangesAsync(); }
            }
            else
            {
                var rev = await appContext.Reviews.FindAsync(id);
                if (rev != null) { appContext.Reviews.Remove(rev); await appContext.SaveChangesAsync(); }
            }
            return Ok(new ApiResponse<object>(true, "Content removed", null));
        }
    }
}
