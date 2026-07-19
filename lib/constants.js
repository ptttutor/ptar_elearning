// Subjects enum matching Prisma schema
export const SUBJECTS = {
  Thai: { value: 'Thai', label: 'ภาษาไทย' },
  Mathematics: { value: 'Mathematics', label: 'คณิตศาสตร์' },
  Science: { value: 'Science', label: 'วิทยาศาสตร์' },
  Physics: { value: 'Physics', label: 'ฟิสิกส์' },
  Chemistry: { value: 'Chemistry', label: 'เคมี' },
  Biology: { value: 'Biology', label: 'ชีววิทยา' },
  SocialStudies: { value: 'SocialStudies', label: 'สังคมศึกษา ศาสนา วัฒนธรรม' },
  History: { value: 'History', label: 'ประวัติศาสตร์' },
  Geography: { value: 'Geography', label: 'ภูมิศาสตร์' },
  HealthAndPE: { value: 'HealthAndPE', label: 'สุขศึกษาและพลศึกษา' },
  Art: { value: 'Art', label: 'ศิลปะ' },
  Music: { value: 'Music', label: 'ดนตรี' },
  OccupationsAndTechnology: { value: 'OccupationsAndTechnology', label: 'การงานอาชีพและเทคโนโลยี' },
  ComputerScience: { value: 'ComputerScience', label: 'วิทยาการคอมพิวเตอร์' },
  ForeignLanguages: { value: 'ForeignLanguages', label: 'ภาษาต่างประเทศ' },
  English: { value: 'English', label: 'ภาษาอังกฤษ' },
  Chinese: { value: 'Chinese', label: 'ภาษาจีน' },
  Japanese: { value: 'Japanese', label: 'ภาษาญี่ปุ่น' },
};

// Helper function to get subject options for select components
export const getSubjectOptions = () => {
  return Object.values(SUBJECTS).map(subject => ({
    value: subject.value,
    label: subject.label,
  }));
};

// Helper function to get subject label by value
export const getSubjectLabel = (value) => {
  const subject = Object.values(SUBJECTS).find(s => s.value === value);
  return subject ? subject.label : value;
};

// Grade Level enum matching Prisma schema
export const GRADE_LEVELS = {
  JUNIOR_HIGH: { value: 'JUNIOR_HIGH', label: 'ม.ต้น (มัธยมศึกษาตอนต้น)' },
  SENIOR_HIGH: { value: 'SENIOR_HIGH', label: 'ม.ปลาย (มัธยมศึกษาตอนปลาย)' },
};

// Helper function to get grade level options for select components
export const getGradeLevelOptions = () => {
  return Object.values(GRADE_LEVELS).map(level => ({
    value: level.value,
    label: level.label,
  }));
};

// Helper function to get grade level label by value
export const getGradeLevelLabel = (value) => {
  const level = Object.values(GRADE_LEVELS).find(l => l.value === value);
  return level ? level.label : value;
};