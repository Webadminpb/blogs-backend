require('dotenv').config();
const axios = require('axios');
const { Menu, Submenu } = require('./models');
const { endpoints, normalise, toSlug } = require('./strapi-helpers');

async function migrateMenus() {
  console.log('Fetching menus from Strapi...');
  const menusResponse = await axios.get(endpoints.menus);
  const strapiMenus = menusResponse.data?.data || [];

  for (const entry of strapiMenus) {
    const strapiMenu = normalise(entry);
    const menuData = {
      name: strapiMenu.name,
      slug: strapiMenu.slug || toSlug(strapiMenu.name),
      description: strapiMenu.description || null,
      index: strapiMenu.index || 0,
      status: strapiMenu.status ?? true,
    };

    let menu = await Menu.findOne({ slug: menuData.slug });
    if (menu) {
      await Menu.updateOne({ _id: menu._id }, { $set: menuData });
      console.log(`✓ Updated menu: ${strapiMenu.name}`);
    } else {
      menu = await Menu.create(menuData);
      console.log(`✓ Created menu: ${strapiMenu.name}`);
    }
  }

  console.log('Fetching submenus from Strapi...');
  const submenusResponse = await axios.get(endpoints.submenus);
  const strapiSubmenus = submenusResponse.data?.data || [];

  for (const entry of strapiSubmenus) {
    const strapiSubmenu = normalise(entry);
    const parentName = strapiSubmenu.menu?.data
      ? strapiSubmenu.menu.data.attributes?.name
      : strapiSubmenu.menu?.name;

    let parentSlug = strapiSubmenu.menu?.data
      ? strapiSubmenu.menu.data.attributes?.slug
      : strapiSubmenu.menu?.slug;
    const targetSlug = strapiSubmenu.slug || toSlug(strapiSubmenu.name);

    if (!parentSlug && parentName) {
      parentSlug = toSlug(parentName);
    }

    const parentMenu = await Menu.findOne({
      $or: [{ slug: parentSlug }, { name: parentName }],
    });

    if (!parentMenu) {
      console.warn(
        `⚠ Parent menu not found for submenu: ${strapiSubmenu.name}`,
      );
      continue;
    }

    const submenuData = {
      name: strapiSubmenu.name,
      slug: targetSlug,
      parent_id: parentMenu._id,
      showOnHomePage: strapiSubmenu.showOnHomePage || false,
      status: strapiSubmenu.status ?? true,
    };

    const existingSubmenu = await Submenu.findOne({
      slug: targetSlug,
      parent_id: parentMenu._id,
    });

    if (existingSubmenu) {
      await Submenu.updateOne(
        { _id: existingSubmenu._id },
        { $set: submenuData },
      );
      console.log(`✓ Updated submenu: ${strapiSubmenu.name}`);
    } else {
      await Submenu.create(submenuData);
      console.log(`✓ Created submenu: ${strapiSubmenu.name}`);
    }
  }

  console.log('Menu migration completed!');
}

module.exports = migrateMenus;

