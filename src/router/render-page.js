export default async function(path, match) {
  const main = document.querySelector('main');

  /*todo implement loading logic*/

  const { default: Page } = await import(`../pages/${path}/index.js`);
  const page = new Page();
  const element = await page.render();

  const contentNode = document.querySelector('#content');

  contentNode.innerHTML = '';
  contentNode.append(element);

  return page;
}
