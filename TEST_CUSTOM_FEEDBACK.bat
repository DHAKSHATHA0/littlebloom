@echo off
echo Testing Custom Feedback Functionality...
echo.

echo Instructions to test custom feedback:
echo.
echo 1. SETUP:
echo    - Start backend server (START_BACKEND.bat)
echo    - Start frontend server (START_FRONTEND.bat)
echo    - Ensure you have delivered orders as a buyer
echo.
echo 2. TEST CUSTOM FEEDBACK:
echo    - Login as a BUYER
echo    - Go to Profile page
echo    - Find a delivered order without rating
echo    - Click on stars to rate (e.g., 4 stars)
echo    - Type custom feedback like: "Great product, love it!"
echo    - Click "Submit Review"
echo.
echo 3. VERIFY PERSISTENCE:
echo    - Refresh the page
echo    - Check that your custom feedback appears
echo    - Should show: "Your feedback: Great product, love it!"
echo    - NOT: "Your feedback: Rated 4 stars"
echo.
echo 4. TEST SELLER VIEW:
echo    - Login as the SELLER of that product
echo    - Go to Profile page
echo    - Check "Delivered Orders with Ratings" table
echo    - Feedback column should show: "Great product, love it!"
echo    - NOT: "Rated 4 stars"
echo.
echo 5. TEST DIFFERENT SCENARIOS:
echo    - Rate without feedback (should show "Rated X stars")
echo    - Rate with empty feedback (should show "Rated X stars")
echo    - Rate with custom feedback (should show custom text)
echo    - Long feedback (should truncate in seller table with "...")
echo.
echo 6. CHECK BROWSER CONSOLE:
echo    - Open Developer Tools (F12)
echo    - Look for logs like:
echo      "Feedback for order X: Great product, love it!"
echo      "Submitting review with feedback: {feedback: 'Great product, love it!'}"
echo.
echo Expected Results:
echo ✅ Custom feedback appears in buyer profile
echo ✅ Custom feedback appears in seller table
echo ✅ Feedback persists after page refresh
echo ✅ Character counter shows 0-200
echo ✅ Placeholder text encourages custom feedback
echo.

pause