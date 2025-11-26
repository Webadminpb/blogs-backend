import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateSubmenuDto } from './dto/create-submenu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ✅ Create a new menu
  @Post('menus')
  @UseGuards(JwtAuthGuard)
  createMenu(@Body() body: CreateMenuDto) {
    return this.menuService.createMenu(body);
  }

  // ✅ Get all menus (public)
  @Get('menus')
  getAllMenus() {
    return this.menuService.getAllMenus();
  }

  @Get()
  getMenusRoot() {
    return this.menuService.getAllMenus();
  }

  // ✅ Get all menus with submenus (admin only)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  getAllWithSubmenus() {
    return this.menuService.getAllWithSubmenus();
  }

  // ✅ Update menu
  @Put('menus/:id')
  @UseGuards(JwtAuthGuard)
  updateMenu(@Param('id') id: string, @Body() body: CreateMenuDto) {
    return this.menuService.updateMenu(id, body);
  }

  // ✅ Delete menu and its submenus
  @Delete('menus/:id')
  @UseGuards(JwtAuthGuard)
  deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }

  // ✅ Create submenu
  @Post('submenus')
  @UseGuards(JwtAuthGuard)
  createSubmenu(@Body() body: CreateSubmenuDto) {
    return this.menuService.createSubmenu(body);
  }

  // ✅ Delete submenu
  @Delete('submenus/:id')
  @UseGuards(JwtAuthGuard)
  deleteSubmenu(@Param('id') id: string) {
    return this.menuService.deleteSubmenu(id);
  }
}
