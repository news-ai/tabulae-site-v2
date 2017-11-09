export const initialState = {
  personReducer: {
    isReceiving: false,
    didInvalidate: false,
    firstTimeUser: false,
    feedback: false,
    feedbackDidInvalidate: false,
    feedbackIsReceiving: false,
    currentFetchingUsers: []
  },
  contactReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: []
  },
  listReducer: {
    isReceiving: false,
    didInvalidate: false,
    lists: { // mostRecentlyUpdated
      received: [],
      offset: 0
    },
    archived: {
      received: [],
      offset: 0
    },
    public: {
      received: [],
      offset: 0
    },
    team: {
      received: [],
      offset: 0
    },
    mostRecentlyCreated: {
      received: [],
      offset: 0
    },
    leastRecentlyCreated: {
      received: [],
      offset: 0
    },
    leastRecentlyUsed: {
      received: [],
      offset: 0
    },
    alphabetical: {
      received: [],
      offset: 0
    },
    antiAlphabetical: {
      received: [],
      offset: 0
    },
    // lists: [],
    // archivedLists: [],
    // publicLists: [],
    // teamLists: [],
    received: [],
    // offset: 0,
    // archivedOffset: 0,
    // publicOffset: 0,
    // teamOffset: 0,
    tagLists: [],
    clientLists: [],
  },
  stagingReducer: {
    isReceiving: false,
    didInvalidate: false,
    previewEmails: [],
    received: [],
    offset: 0,
    contactOffsets: {},
    listOffsets: {},
    archivedOffsets: {},
    utctime: null,
    scheduledOffset: 0,
    filterQuery: {}
  },
  emailAttachmentReducer: {
    attached: [],
    isReceiving: false,
    isAttachmentPanelOpen: false
  },
  publicationReducer: {
    isReceiving: false,
    didInvalidate: false,
    publicationMapByName: {},
    received: [],
    searchCache: []
  },
  fileReducer: {
    isReceiving: false,
    didInvalidate: false,
    isProcessWaiting: false
  },
  headerReducer: {
    isReceiving: false,
    didInvalidate: false,
  },
  templateReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
    offset: 0
  },
  searchReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
    offset: 0
  },
  feedReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  headlineReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  mixedReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  listfeedReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  tweetReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  instagramReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  twitterProfileReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  instagramProfileReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  twitterDataReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  instagramDataReducer: {
    isReceiving: false,
    didInvalidate: false,
    received: [],
  },
  joyrideReducer: {
    showUploadGuide: false,
    showGeneralGuide: false,
    currentStep: 0
  },
  clientReducer: {
    isReceiving: false,
    didInvalidate: false,
  },
  emailImageReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  emailDraftReducer: {
    editorState: null,
    isAttachmentPanelOpen: false,
    templateChanged: false,
    templateChangeType: 'overwrite',
  },
  emailPreviewDraftReducer: {
  },
  smtpReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  publicationProfileReducer: {
    isReceiving: false,
    didInvalidate: false
  },
  notificationReducer: {
    messages: [],
  },
  emailStatsReducer: {
    isReceiving: false,
    didInvalidate: false,
    offset: 0,
    received: [],
  },
  isFetchingReducer: {
    lists: {},
  },
  campaignStatsReducer: {
    isReceiving: false,
    didInvalidate: false,
    offset: 0,
    received: [],
  },
  contactTagReducer: {
    isReceiving: false,
    didInvalidate: false,
  }
};
