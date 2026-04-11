export enum Category {
  Work = 'work',
  Learning = 'learning',
  Social = 'social',
  Entertainment = 'entertainment',
  News = 'news',
  Other = 'other',
}

export interface CategoryMeta {
  label: string;
  color: string;
  tint: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.Work]: {
    label: 'Work',
    color: 'var(--cat-work)',
    tint: 'var(--cat-work-tint)',
  },
  [Category.Learning]: {
    label: 'Learning',
    color: 'var(--cat-learning)',
    tint: 'var(--cat-learning-tint)',
  },
  [Category.Social]: {
    label: 'Social',
    color: 'var(--cat-social)',
    tint: 'var(--cat-social-tint)',
  },
  [Category.Entertainment]: {
    label: 'Entertainment',
    color: 'var(--cat-entertainment)',
    tint: 'var(--cat-entertainment-tint)',
  },
  [Category.News]: {
    label: 'News',
    color: 'var(--cat-news)',
    tint: 'var(--cat-news-tint)',
  },
  [Category.Other]: {
    label: 'Other',
    color: 'var(--cat-other)',
    tint: 'var(--cat-other-tint)',
  },
};

/** Map of domain → category override set by user */
export type CategoryOverrides = Record<string, Category>;
