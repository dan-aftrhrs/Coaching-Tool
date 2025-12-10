
export interface MeetingHistoryItem {
  date: string;
  summary: string;
}

export interface ProfileSection {
  iamStatements: string;
  vision: string;
  pastMeetings: string; // Keeping for backward compatibility/general context
  meetingHistory: MeetingHistoryItem[];
}

export interface EngageSection {
  goodnessOfGod: string;
  wins: string;
  improvements: string;
  nextStepForward: string;
  learning: string;
}

export interface ExploreSection {
  foundationIams: string;
  conversationNotes: string;
  // This is a free-form field for the "Direction Questions" answers
}

export interface ExpressSection {
  nextStepsThinking: string;
  firstSteps: string;
  stickToIt: string;
  whenWillYouDoThis: string;
  obstacles: string;
  whoToTell: string;
  visualCue: string;
  importance: string;
  sacrifices: string;
  actionSteps: string[];
  encouragement: string;
}

export interface ExtendSection {
  keyInsight: string;
  prayerPoint: string;
  nextMeeting: string;
}

export interface SessionData {
  coacheeName: string;
  date: string;
  profile: ProfileSection;
  engage: EngageSection;
  explore: ExploreSection;
  express: ExpressSection;
  extend: ExtendSection;
}

export enum TabView {
  PROFILE = 'PROFILE',
  ENGAGE = 'ENGAGE',
  EXPLORE = 'EXPLORE',
  EXPRESS = 'EXPRESS',
  EXTEND = 'EXTEND',
  SUMMARY = 'SUMMARY'
}
