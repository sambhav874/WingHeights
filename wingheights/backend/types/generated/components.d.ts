import type { Schema, Struct } from '@strapi/strapi';

export interface FormsInsuranceQuoteForm extends Struct.ComponentSchema {
  collectionName: 'components_forms_insurance_quote_forms';
  info: {
    description: '';
    displayName: 'Insurance Quote Form';
  };
  attributes: {
    title: Schema.Attribute.Enumeration<['Insurance Quote Form']>;
  };
}

export interface FormsTwoColumnFormLayout extends Struct.ComponentSchema {
  collectionName: 'components_forms_two_column_form_layouts';
  info: {
    displayName: 'TwoColumnFormLayout';
  };
  attributes: {
    leftColumn: Schema.Attribute.Blocks;
    rightColumn: Schema.Attribute.Component<
      'forms.insurance-quote-form',
      false
    >;
  };
}

export interface MenuNavigationItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_navigation_items';
  info: {
    description: '';
    displayName: 'Navigation Item';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer;
    subNavItem: Schema.Attribute.Component<'menu.sub-navigation-item', true>;
  };
}

export interface MenuSubNavigationItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_sub_navigation_items';
  info: {
    description: '';
    displayName: 'Sub Navigation Item';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String;
  };
}

export interface PageComponentsHeadBanner extends Struct.ComponentSchema {
  collectionName: 'components_page_components_head_banners';
  info: {
    description: '';
    displayName: 'headBanner';
  };
  attributes: {
    smallDescription: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface PageComponentsSlider extends Struct.ComponentSchema {
  collectionName: 'components_page_components_sliders';
  info: {
    displayName: 'Slider';
  };
  attributes: {
    files: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    description: '';
    displayName: 'SEO';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    description: '';
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    caption: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    description: '';
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    author: Schema.Attribute.String;
    text: Schema.Attribute.Text;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedTwoColumnLayout extends Struct.ComponentSchema {
  collectionName: 'components_shared_two_column_layouts';
  info: {
    description: '';
    displayName: 'TwoColumnLayout';
  };
  attributes: {
    leftColumn: Schema.Attribute.Blocks;
    rightColumn: Schema.Attribute.Blocks;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'forms.insurance-quote-form': FormsInsuranceQuoteForm;
      'forms.two-column-form-layout': FormsTwoColumnFormLayout;
      'menu.navigation-item': MenuNavigationItem;
      'menu.sub-navigation-item': MenuSubNavigationItem;
      'page-components.head-banner': PageComponentsHeadBanner;
      'page-components.slider': PageComponentsSlider;
      'seo.seo': SeoSeo;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.two-column-layout': SharedTwoColumnLayout;
    }
  }
}
