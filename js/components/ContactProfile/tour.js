const tour = {
  id: 'profile-hopscotch',
  steps: [
    {
      title: 'Default Contact Fields',
      content: 'These are default columns Tabulae has. The social fields get attached to feeds.',
      target: 'contact_profile_default_hop',
      placement: 'right'
    },
    {
      title: 'Custom Contact Fields',
      content: 'When you add Custom Columns in Table, this is where you can see/update those values.',
      target: 'contact_profile_custom_hop',
      placement: 'right'
    },
    {
      title: 'RSS Feeds',
      content: 'You can subscribe to any kind of RSS feeds by adding them here and it will show up in the feeds.',
      target: 'rss_settings_hop',
      placement: 'top'
    },
    {
      title: 'Engagement Data',
      content: 'Click the bar chart icon here to see the engagement data for this contact',
      target: 'insta_data_hop',
      placement: 'right'
    },
  ]
};

export default tour;
