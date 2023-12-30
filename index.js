const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const json_path = `${__dirname}/models.json`;
  const browser = await puppeteer.launch({headless: true});
  try {
    var models = [];
    if (fs.existsSync(json_path)) {
      const models_json = fs.readFileSync(json_path, 'utf8');
      models = JSON.parse(models_json);
    }

    const page = await browser.newPage();
    await page.goto('https://kakaku.com/kuruma/fueltype/electric-car/');
    const model_items = await page.$$('.p-new_model_item');
    for (const item of model_items.reverse()) {
      const model = {
        maker: (await (await item.$('.p-new_model_maker')).evaluate(e => e.textContent)).trim(),
        name: (await (await item.$('.p-new_model_name')).evaluate(e => e.textContent)).trim(),
        date: (await (await item.$('.p-new_model_date')).evaluate(e => e.textContent)).trim(),
        note: (await (await item.$('.p-new_model_note')).evaluate(e => e.textContent)).trim(),
        image: (await (await item.$('img')).evaluate(e => e.src)).trim(),
        url: (await (await item.$('a')).evaluate(e => e.href)).trim(),
      };

      if (!models.some(m => m.url === model.url)) {
        console.log(model);
        models.push(model);
      }
    }

    const new_models_json = JSON.stringify(models, null, 2);
    fs.writeFileSync(json_path, new_models_json, 'utf8');
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
})();