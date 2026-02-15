from playwright.sync_api import sync_playwright, expect

def verify_auth_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to the Auth Page
        print("Navigating to http://localhost:5000/auth")
        page.goto("http://localhost:5000/auth")

        # 2. Wait for the password input to be visible
        print("Waiting for password input...")
        password_input = page.locator("input[name='password']").first
        expect(password_input).to_be_visible()

        # 3. Type a password
        print("Typing password...")
        password_input.fill("secret123")

        # 4. Verify initial type is password
        print("Verifying initial type is password...")
        expect(password_input).to_have_attribute("type", "password")

        # 5. Click the toggle button (Show password)
        print("Clicking show password toggle...")
        show_btn = page.get_by_label("Show password").first
        show_btn.click()

        # 6. Verify type changes to text
        print("Verifying type changed to text...")
        expect(password_input).to_have_attribute("type", "text")

        # 7. Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/auth_page_show_password.png")

        # 8. Click again to hide (Label should now be Hide password)
        print("Clicking hide password toggle...")
        hide_btn = page.get_by_label("Hide password").first
        hide_btn.click()

        # 9. Verify type changes back to password
        print("Verifying type changed back to password...")
        expect(password_input).to_have_attribute("type", "password")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    verify_auth_page()
