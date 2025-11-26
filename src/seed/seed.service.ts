import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
import { MenuService } from '../menu/menu.service';
import { SettingsService } from '../settings/settings.service';
import { UserRole, UserDocument } from '../users/user.schema'; // Make sure enum is imported
import { Types } from 'mongoose';
import { CreatePostDto } from '../posts/dto/create-post.dto';

@Injectable()
export class SeedService {
  constructor(
    private readonly users: UsersService,
    private readonly posts: PostsService,
    private readonly menuService: MenuService,
    private readonly settings: SettingsService,
  ) {}

  async run() {
    // Users (demo admin)
    const demoUser = {
      name: 'Admin Demo',
      email: 'admin@gmail.com',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      password: 'admin123', // demo only
      avatar_url: '',
    };
    await this.users.create(demoUser);

    // Menus and Submenus
    const baseMenus: Array<{
      name: string;
      slug: string;
      subCategories: string[];
    }> = [
      {
        name: 'BEAUTY',
        slug: 'beauty',
        subCategories: [
          'beauty tips',
          'hair',
          'facial',
          'skin',
          'grooming',
          'makeup',
          'nail',
        ],
      },
      {
        name: 'TRENDS',
        slug: 'trends',
        subCategories: ['influencers', 'beauty trends', 'celebrities'],
      },
      {
        name: 'CAREER',
        slug: 'career',
        subCategories: ['hiring talent', 'career tips'],
      },
      {
        name: 'FEATURES',
        slug: 'features',
        subCategories: ['interview stories'],
      },
      {
        name: 'PRODUCT',
        slug: 'product',
        subCategories: ['product', 'equipment'],
      },
      {
        name: 'LOCATION',
        slug: 'location',
        subCategories: ['india', 'singapore'],
      },
    ];
    const defaultMenus = baseMenus.map((menu, index) => ({
      ...menu,
      index,
    }));

    for (const menuData of defaultMenus) {
      const { subCategories, ...menuFields } = menuData;
      const createdMenu = await this.menuService.createMenu({
        name: menuFields.name,
        slug: menuFields.slug,
        index: menuFields.index,
        status: true,
      });

      for (const subName of subCategories) {
        const subSlug = subName.toLowerCase().replace(/\s+/g, '-');
        await this.menuService.createSubmenu({
          name: subName,
          slug: subSlug,
          parent_id: createdMenu._id as Types.ObjectId,
          showOnHomePage: false,
        });
      }
    }

    const authorProfiles = [
      {
        name: 'Aarushi Mehta',
        role: UserRole.AUTHOR,
        description: 'Beauty expert and editor',
        index: 0,
      },
      {
        name: 'Kavita Sharma',
        role: UserRole.AUTHOR,
        description: 'Hair stylist and writer',
        index: 1,
      },
    ];

    const createdAuthors: UserDocument[] = [];
    for (const profile of authorProfiles) {
      const author = await this.users.create(profile);
      createdAuthors.push(author);
    }

    // Sample posts (use loop with await for each post)
    const samplePosts: CreatePostDto[] = [
      {
        title: '10 Beauty Hacks That Actually Work',
        slug: 'beauty-hacks-that-work',
        menus: ['beauty'],
        submenus: ['beauty-tips'],
        authors: [
          {
            _id: String(createdAuthors[0]._id),
            name: createdAuthors[0].name,
            description: createdAuthors[0].description,
          },
        ],
        status: 'published',
        tags: ['makeup', 'skincare', 'daily tips'],
        description:
          'Learn the top 10 simple beauty hacks to upgrade your daily routine.',
        content:
          'Learn the top 10 simple beauty hacks to upgrade your daily routine.',
        thumbnail: '',
        images: [],
        index: 0,
      },
      {
        title: 'Top Trends in Hair Styling for 2025',
        slug: 'top-hair-trends-2025',
        menus: ['trends'],
        submenus: ['beauty-trends'],
        authors: [
          {
            _id: String(createdAuthors[1]._id),
            name: createdAuthors[1].name,
            description: createdAuthors[1].description,
          },
        ],
        status: 'draft',
        tags: ['hairstyle', 'fashion', 'celebrity'],
        description:
          'Discover this year’s most trending hairstyles and how to get the look.',
        content:
          'Discover this year’s most trending hairstyles and how to get the look.',
        thumbnail: '',
        images: [],
        index: 1,
      },
    ];

    // Seed posts individually
    for (const post of samplePosts) {
      await this.posts.create(post);
    }

    // Settings default (assuming .create exists)
    const defaultSettings = {
      site_name: 'daSalon',
      site_description: 'Recreation of dasalon-blogs',
      logo_url: '',
      favicon_url: '',
      facebook_url: '',
      twitter_url: '',
      instagram_url: '',
      linkedin_url: '',
      theme: 'light',
      posts_per_page: 10,
      updated_at: new Date().toISOString(),
    };

    // Use create or update depending on your service API
    await this.settings.create(defaultSettings);

    // Gather statistics
    const allUsers = await this.users.findAll();
    const allPosts = await this.posts.findAll();

    return {
      users: allUsers.length,
      menus: (await this.menuService.getAllMenus()).length,
      posts: allPosts.length,
      settings: await this.settings.get(),
    };
  }
}
