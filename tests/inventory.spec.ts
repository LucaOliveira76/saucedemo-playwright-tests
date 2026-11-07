import { test, expect } from '@playwright/test';
import { users } from '../test-data/users';

test.describe('Inventory functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('username').fill(users.standard_user.username);
        await page.getByTestId('password').fill(users.standard_user.password);
        await page.getByTestId('login-button').click();
        await expect(page).toHaveURL(/inventory\.html/);
    });

    test('should display the correct number of products', async ({ page }) => {
        await expect(page.getByTestId('inventory-item')).toHaveCount(6);
    });

    test('every product should have a name, description, price and image', async ({ page }) => {
        const products = page.getByTestId('inventory-item');
        for (const product of await products.all()) {
            await expect(product.getByTestId('inventory-item-name')).toHaveText(/.+/);
            await expect(product.getByTestId('inventory-item-desc')).toHaveText(/.+/);
            await expect(product.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
            await expect(product.getByRole('img')).toBeVisible();
        };
    });

    test('should sort products for A-Z', async ({ page }) => {
        // Confirm that the inventory contains products before taking a snapshot.
        await expect(page.getByTestId('inventory-item')).toHaveCount(6);

        // Build the expected A-Z order from the current product set.
        const productNamesBeforeSorting = await page.getByTestId('inventory-item-name').allTextContents();
        const sortedProductNames = [...productNamesBeforeSorting].sort();

        // Apply A-Z sorting and verify the displayed order.
        await page.getByTestId('product-sort-container').selectOption('az');
        await expect(page.getByTestId('inventory-item-name')).toHaveText(sortedProductNames);
    });

    test('should sort products for Z-A', async ({ page }) => {
        // Confirm that the inventory contains products before taking a snapshot.
        await expect(page.getByTestId('inventory-item')).toHaveCount(6);

        // Build the expected Z-A order from the current product set.
        const productNamesBeforeSorting = await page.getByTestId('inventory-item-name').allTextContents();
        const sortedProductNames = [...productNamesBeforeSorting].sort().reverse();

        // Apply Z-A sorting and verify the displayed order.
        await page.getByTestId('product-sort-container').selectOption('za');
        await expect(page.getByTestId('inventory-item-name')).toHaveText(sortedProductNames);
    });
});
