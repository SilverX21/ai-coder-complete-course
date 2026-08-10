import { expect, test, type Page } from "@playwright/test";

async function waitForHydration(page: Page) {
  await expect(page.getByTestId("board-title")).toBeVisible();
  await expect(page.getByTestId("add-card-btn-col-backlog")).toBeEnabled();
}

test.describe("Kanban board", () => {
  test("loads with dummy data", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await expect(page.getByTestId("board-title")).toHaveText("Product Launch");
    await expect(page.getByTestId("view-board")).toBeVisible();
    await expect(page.getByTestId("column-col-backlog")).toBeVisible();
    await expect(page.getByTestId("column-col-ready")).toBeVisible();
    await expect(page.getByTestId("column-col-progress")).toBeVisible();
    await expect(page.getByTestId("column-col-review")).toBeVisible();
    await expect(page.getByTestId("column-col-done")).toBeVisible();
    await expect(page.getByTestId("card-card-1")).toContainText("Define launch messaging");
  });

  test("renames a column", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await page.getByTestId("column-title-col-backlog").click();
    const input = page.getByTestId("column-title-input-col-backlog");
    await expect(input).toBeVisible();
    await input.fill("Ideas");
    await input.press("Enter");

    await expect(page.getByTestId("column-title-col-backlog")).toHaveText("Ideas");
  });

  test("adds a card to a column", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await page.getByTestId("add-card-btn-col-review").click();
    await page.getByTestId("card-title-input-col-review").fill("QA checklist");
    await page.getByTestId("card-details-input-col-review").fill("Smoke test all launch paths.");
    await page.getByTestId("submit-card-col-review").click();

    await expect(page.getByText("QA checklist")).toBeVisible();
    await expect(page.getByText("Smoke test all launch paths.")).toBeVisible();
  });

  test("edits a card title and details", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await page.getByTestId("edit-card-card-1").click({ force: true });
    await page.getByTestId("edit-card-title-card-1").fill("Launch messaging v2");
    await page.getByTestId("edit-card-details-card-1").fill("Revised headline and CTA.");
    await page.getByTestId("save-card-card-1").click();

    await expect(page.getByTestId("card-card-1")).toContainText("Launch messaging v2");
    await expect(page.getByTestId("card-card-1")).toContainText("Revised headline and CTA.");
  });

  test("deletes a card after confirmation", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await expect(page.getByTestId("card-card-8")).toBeVisible();
    await page.getByTestId("delete-card-card-8").click({ force: true });
    await expect(page.getByTestId("confirm-delete-card-8")).toBeVisible();
    await page.getByTestId("confirm-delete-btn-card-8").click();

    await expect(page.getByTestId("card-card-8")).toHaveCount(0);
  });

  test("drags a card to another column", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    const card = page.getByTestId("card-card-1");
    const target = page.getByTestId("column-drop-col-done");

    await expect(page.getByTestId("column-col-backlog").getByTestId("card-card-1")).toBeVisible();

    const cardBox = await card.boundingBox();
    const targetBox = await target.boundingBox();
    if (!cardBox || !targetBox) {
      throw new Error("Missing bounding boxes for drag");
    }

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + Math.min(40, targetBox.height / 2), {
      steps: 20,
    });
    await page.mouse.up();

    await expect(page.getByTestId("column-col-done").getByTestId("card-card-1")).toBeVisible();
    await expect(page.getByTestId("column-col-backlog").getByTestId("card-card-1")).toHaveCount(0);
  });

  test("toggles board, list, and compact views", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await expect(page.getByTestId("view-board")).toBeVisible();
    await expect(page.getByTestId("density-comfortable")).toBeVisible();

    await page.getByTestId("toggle-view-list").click();
    await expect(page.getByTestId("view-list")).toBeVisible();
    await expect(page.getByTestId("list-section-col-backlog")).toBeVisible();

    await page.getByTestId("toggle-view-board").click();
    await expect(page.getByTestId("view-board")).toBeVisible();

    await page.getByTestId("toggle-density-compact").click();
    await expect(page.getByTestId("density-compact")).toBeVisible();
  });
});
