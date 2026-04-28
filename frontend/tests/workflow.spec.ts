  import { test as base, expect } from '@playwright/test';

  const username = process.env.E2E_USERNAME ?? 'user';
  const password = process.env.E2E_PASSWORD ?? 'password';

  base('workflow', async ({ browser }) => {
    const context = await browser.newContext({
      recordHar: { path: '../fortify/FortifyDemoApp-Dev-Workflow.har' }
    });
    const page = await context.newPage();
    // Login
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.screenshot({ path: 'login.png' });
    await page.locator('.input').first().fill(username); // Username
    await page.locator('.input').nth(1).fill(password); // Password
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/dashboard.png' });

    // Profile update
    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page.locator('.card .input').first()).toBeVisible();
    await page.locator('.input').nth(1).fill('user1@example.com'); // Email
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/profile_after_update.png' });

    // Profile "undo" update
    await page.locator('.input').nth(1).fill('user@example.com'); // Email
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/profile_after_undo.png' });

    // Payments
    await page.getByRole('button', { name: 'Payments' }).click();
    await expect(page.getByText(/payment methods/i)).toBeVisible();
      // Wait for payment methods to be loaded (if any)
      const paymentMethod = page.locator('.card ul li').first();
      if (await paymentMethod.count()) {
        await page.screenshot({ path: 'tests/screenshots/payments.png' });
        await expect(paymentMethod).toBeVisible();
        await paymentMethod.click();
        await page.getByRole('button', { name: /Charge/ }).click();
      }
      await page.screenshot({ path: 'tests/screenshots/payments_after_charge.png' });

      // Add payment method (select type, then fill fields)
      await page.locator('.input').first().selectOption('card'); // Card type select
      await page.locator('.input').nth(1).fill('4111111111111111'); // Card Number
      await page.locator('.input').nth(2).fill('12/30'); // Expiry Date
      await page.locator('.input').nth(3).fill('123'); // CVV
      await page.getByRole('button', { name: 'Add' }).click();
    await page.screenshot({ path: 'tests/screenshots/payments_after_add.png' });

    // Users
    await page.getByRole('button', { name: 'Users' }).click();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/users.png' });

    // Files
    await page.getByRole('button', { name: 'Files' }).click();
    await expect(page.getByText(/file & command demo/i)).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/files.png' });

    // Command injection demo
    await page.getByPlaceholder('command (unsafe)').fill('ls /');
    await page.getByRole('button', { name: 'Execute' }).click();
    await expect(page.locator('pre')).toContainText('bin');
    await page.screenshot({ path: 'tests/screenshots/command_injection.png' });

    // Shell demo
    await page.getByPlaceholder('shell input').fill('whoami');
    await page.getByRole('button', { name: 'Run Shell' }).click();
    await page.screenshot({ path: 'tests/screenshots/shell.png' });

    // Read absolute path
    const absPathInput = page.getByPlaceholder(/absolute path/i);
    await expect(absPathInput).toBeVisible();
    await absPathInput.fill('/etc/passwd');
    await page.getByRole('button', { name: 'Read' }).nth(1).click();
    await expect(page.locator('pre')).toContainText('root');
    await page.screenshot({ path: 'tests/screenshots/read_absolute_path.png' });

    // Write file
    await page.getByPlaceholder('file contents').fill('hacker:x:0:0:hacker:/root:/bin/bash');
    await page.getByPlaceholder(/^filename$/).fill('../../etc/passwd');
    await page.getByRole('button', { name: 'Write' }).click();
    const writeResult = page.locator('pre');
    await expect(writeResult).toBeVisible();
    await expect(writeResult).toContainText(/hacker|Error/i);
    await page.screenshot({ path: 'tests/screenshots/write_file.png' });

    await context.close(); // This will write the HAR file
  });