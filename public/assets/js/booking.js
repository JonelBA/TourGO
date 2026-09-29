document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.querySelector('.actual-booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const pickupDate = document.getElementById('pickup_date').value;
            const returnDate = document.getElementById('return_date').value;
            const vehicleId = document.querySelector('input[name="vehicle_id"]').value;

            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking availability...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData();
                formData.append('vehicle_id', vehicleId);
                formData.append('pickup_date', pickupDate);
                formData.append('return_date', returnDate);

                // Static frontend demo: check dates against localStorage bookings
                // instead of calling the original PHP/AJAX endpoint.
                let bookings = [];
                try {
                    bookings = JSON.parse(localStorage.getItem('tourgo_demo_bookings') || '[]');
                    if (!Array.isArray(bookings)) bookings = [];
                } catch (error) {
                    bookings = [];
                }

                const requestedStart = new Date(pickupDate + 'T00:00:00');
                const requestedEnd = new Date(returnDate + 'T00:00:00');

                const overlaps = bookings.some(function (booking) {
                    if (String(booking.vehicleId) !== String(vehicleId)) return false;
                    if (!booking.pickupDate || !booking.returnDate) return false;

                    const existingStart = new Date(booking.pickupDate + 'T00:00:00');
                    const existingEnd = new Date(booking.returnDate + 'T00:00:00');

                    return requestedStart <= existingEnd && requestedEnd >= existingStart;
                });

                if (overlaps) {
                    showToast('Vehicle is not available for the selected dates.', 'error');
                } else {
                    this.submit();
                }
            } catch (error) {
                showToast('Error checking availability. Please try again.', 'error');
                console.error('Error:', error);
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
