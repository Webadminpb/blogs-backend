import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu } from './menu.schema';
import { Submenu } from './submenu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateSubmenuDto } from './dto/create-submenu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<Menu>,
    @InjectModel(Submenu.name) private submenuModel: Model<Submenu>,
  ) {}

  // ✅ Create menu
  async createMenu(data: CreateMenuDto) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
    const index = typeof data.index === 'number' ? data.index : 0;
    return this.menuModel.create({
      ...data,
      slug,
      index,
      status: data.status ?? true,
    });
  }

  private async buildMenuResponse({
    includeInactive = false,
  }: {
    includeInactive?: boolean;
  }) {
    const menuFilter = includeInactive ? {} : { status: true };
    const submenuFilter = includeInactive ? {} : { status: true };
    const menus = await this.menuModel
      .find(menuFilter)
      .sort({ index: 1, name: 1 })
      .lean();
    const submenus = await this.submenuModel
      .find(submenuFilter)
      .sort({ name: 1 })
      .lean();

    return menus.map((menuDoc) => {
      const menuId =
        typeof menuDoc._id === 'string'
          ? menuDoc._id
          : menuDoc._id instanceof Types.ObjectId
            ? menuDoc._id.toHexString()
            : undefined;
      return {
        menu: {
          _id: menuDoc._id,
          name: menuDoc.name,
          slug: menuDoc.slug,
          description: menuDoc.description,
          index: menuDoc.index,
          status: menuDoc.status,
        },
        submenus: submenus.filter(
          (s) => menuId && s.parent_id && String(s.parent_id) === menuId,
        ),
      };
    });
  }

  // ✅ Get all menus (public)
  async getAllMenus() {
    return this.buildMenuResponse({ includeInactive: false });
  }

  // ✅ Get all menus with submenus (for admin panel)
  async getAllWithSubmenus() {
    return this.buildMenuResponse({ includeInactive: true });
  }

  // ✅ Update menu
  async updateMenu(id: string, data: CreateMenuDto) {
    return this.menuModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  // ✅ Delete menu + related submenus
  async deleteMenu(id: string) {
    await this.submenuModel.deleteMany({ parent_id: id });
    return this.menuModel.findByIdAndDelete(id).lean();
  }

  // ✅ Create submenu
  async createSubmenu(data: CreateSubmenuDto) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
    return this.submenuModel.create({
      ...data,
      slug,
      showOnHomePage: data.showOnHomePage ?? false,
    });
  }

  // ✅ Delete submenu
  async deleteSubmenu(id: string) {
    return this.submenuModel.findByIdAndDelete(id).lean();
  }

  // ✅ Search menus
  async search(query: string) {
    const menus = await this.menuModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { slug: { $regex: query, $options: 'i' } },
        ],
      })
      .sort({ index: 1, name: 1 })
      .lean();

    return menus;
  }
}
