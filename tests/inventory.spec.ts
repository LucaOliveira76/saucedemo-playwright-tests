import { test, expect } from '@playwright/test';
import { users } from '../test-data/users';
import { parsePrice } from '../utils/price';

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

    test('should sort products for low to high price', async ({ page }) => {
        // Confirm that the inventory contains products before taking a snapshot.
        await expect(page.getByTestId('inventory-item')).toHaveCount(6);

        // Build the expected low to high price order from the current product set.
        const productPricesBeforeSorting = await page.getByTestId('inventory-item-price').allTextContents();
        const sortedProductPrices = [...productPricesBeforeSorting]
            .map(price => parsePrice(price))
            .sort((a, b) => a - b);

        // Apply low to high price sorting.
        await page.getByTestId('product-sort-container').selectOption('lohi');
        
        // Use expect.poll to wait for the displayed prices to match the sorted prices.
        await expect.poll(async () => {
            const displayedPrices = await page.getByTestId('inventory-item-price').allTextContents();
            const parsedDisplayedPrices = displayedPrices.map(price => parsePrice(price));
            return parsedDisplayedPrices;
        }).toEqual(sortedProductPrices);
    });

    test('should sort products for high to low price', async ({ page }) => {
        // Confirm that the inventory contains products before taking a snapshot.
        await expect(page.getByTestId('inventory-item')).toHaveCount(6);

        // Build the expected high to low price order from the current product set.
        const productPricesBeforeSorting = await page.getByTestId('inventory-item-price').allTextContents();
        const sortedProductPrices = [...productPricesBeforeSorting]
            .map(price => parsePrice(price))
            .sort((a, b) => b - a);

        // Apply high to low price sorting.
        await page.getByTestId('product-sort-container').selectOption('hilo');
        
        // Use expect.poll to wait for the displayed prices to match the sorted prices.
        await expect.poll(async () => {
            const displayedPrices = await page.getByTestId('inventory-item-price').allTextContents();
            const parsedDisplayedPrices = displayedPrices.map(price => parsePrice(price));
            return parsedDisplayedPrices;
        }).toEqual(sortedProductPrices);
    });

    test('should remove a product from the cart when clicking "Remove" button', async ({ page }) => {
        // Select the product to be removed from the cart.
        const selectedProduct = page.getByTestId('inventory-item').filter({hasText: 'Sauce Labs Backpack'});
        
        // Add the selected product to the cart using its data-test.
        await selectedProduct.getByTestId('add-to-cart-sauce-labs-backpack').click();
            // .getByRole('button', { name: 'Add to cart' }).click();
        // check if component with id shopping-cart-link has aria-label attribute with value "1"
        // await expect(page.getByTestId('shopping-cart-link')).toHaveAttribute('aria-label', '1 items');
        await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
        // await selectedProduct.getByRole('button', { name: 'Add to cart' }).click();
        // await expect(page.getByTestId('shopping_cart_badge')).toHaveText('1');
        await page.waitForTimeout(1000); // Wait for the cart badge to update
    });
});
