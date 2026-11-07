import { test, expect } from '@playwright/test';
import { users } from '../test-data/users';

test.describe('Login functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should log in successfully with valid credentials', async ({ page }) => {
        await page.getByTestId('username').fill(users.standard_user.username);
        await page.getByTestId('password').fill(users.standard_user.password);
        await page.getByTestId('login-button').click();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.getByTestId('inventory-container')).toBeVisible();
    });

    test('should get error message with invalid credentials', async ({ page }) => {
        await page.getByTestId('username').fill(users.standard_user.username);
        await page.getByTestId('password').fill('invalid_password');
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('error')).toContainText('Username and password do not match any user in this service');
    });

    test('should get the locked out error message', async ({ page }) => {
        await page.getByTestId('username').fill(users.locked_out_user.username);
        await page.getByTestId('password').fill(users.locked_out_user.password);
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('error')).toContainText('Sorry, this user has been locked out.');
        await expect(page).toHaveURL('/');
    });

    test('should get the empty username error message', async ({ page }) => {
        await page.getByTestId('password').fill(users.standard_user.password);
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('error')).toContainText('Username is required');
    });

    test('should get the empty password error message', async ({ page }) => {
        await page.getByTestId('username').fill(users.standard_user.username);
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('error')).toContainText('Password is required');
    });
});

test.describe('Logout functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('username').fill(users.standard_user.username);
        await page.getByTestId('password').fill(users.standard_user.password);
        await page.getByTestId('login-button').click();
        await expect(page).toHaveURL(/inventory\.html/);
    });

    test('should log out successfully', async ({ page }) => {
        await page.getByRole('button', { name: 'Open Menu' }).click();
        await page.getByTestId('logout-sidebar-link').click();
        await expect(page).toHaveURL('/');
        await expect(page.getByTestId('login-button')).toBeVisible();
    });
});