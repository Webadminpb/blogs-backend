import { Controller, Get, UseGuards } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { MenuService } from '../menu/menu.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class DashboardController {
  constructor(
    private readonly posts: PostsService,
    private readonly menuService: MenuService,
    private readonly users: UsersService,
  ) {}

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async stats() {
    const posts = (await this.posts.findAll()) as Array<{ views?: number }>;
    const totalPosts = posts.length;

    const menus = await this.menuService.getAllMenus();
    const totalCategories = menus.length;

    const users = await this.users.findAll();
    const totalUsers = users.length;

    // Only works if your Post schema has `views: number`
    const totalViews = posts.reduce((acc, post) => {
      const views = typeof post.views === 'number' ? post.views : 0;
      return acc + views;
    }, 0);

    return { totalPosts, totalCategories, totalUsers, totalViews };
  }
}
