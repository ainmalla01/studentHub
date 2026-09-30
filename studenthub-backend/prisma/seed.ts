import { PrismaClient, Difficulty, ChallengeStatus, SubmissionStatus, SubmissionType, SkillCategory, StudentStatus, SkillLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

const skillData = [
  ['JavaScript','PROGRAMMING'],['TypeScript','PROGRAMMING'],['React','FRONTEND'],['Node.js','BACKEND'],['Express.js','BACKEND'],['PostgreSQL','DATABASE'],['Git','TOOLS'],['REST API','BACKEND'],['Linux','DEVOPS'],
] as const;
const studentData = [
  ['MIT-26-CS-041','Aarav Karki',2026,'Computer Science','ACTIVE'],['MIT-26-CS-052','Nisha Thapa',2026,'Computer Science','ACTIVE'],['MIT-25-CS-033','Rohan Shrestha',2025,'Computer Science','ACTIVE'],['MIT-25-IT-019','Sanjay Adhikari',2025,'Information Technology','ACTIVE'],['MIT-26-CS-067','Priya Basnet',2026,'Computer Science','ACTIVE'],['MIT-25-IT-028','Kabir Joshi',2025,'Information Technology','INACTIVE'],
] as const;
const challenges = [
  ['REST API Development','Build a secure REST API for a fictional campus resource management system.','Design and implement a RESTful API with proper authentication, validation, and error handling. Include database schema design and API documentation.','INTERMEDIATE','2026-10-18','GITHUB_LINK','PUBLISHED',['Node.js','Express.js','PostgreSQL']],
  ['Database Optimization Task','Optimize a set of slow-running SQL queries and design efficient indexes for a fictional e-commerce database.','Analyze provided query plans, identify bottlenecks, create appropriate indexes, and rewrite queries for better performance.','ADVANCED','2026-10-05','BOTH','CLOSED',['PostgreSQL','REST API']],
  ['React Component Architecture','Build a reusable component library for a fictional student dashboard with proper state management and accessibility.','Create a set of reusable React components with TypeScript, proper prop typing, accessibility features, and Storybook documentation.','INTERMEDIATE','2026-10-22','GITHUB_LINK','PUBLISHED',['React','TypeScript']],
  ['Linux Server Troubleshooting','Diagnose and resolve issues on a fictional Linux server experiencing performance problems.','Analyze system logs, identify root causes of performance issues, and provide a detailed remediation plan with commands.','ADVANCED','2026-10-12','FILE_UPLOAD','PUBLISHED',['Linux','Git']],
  ['Data Analysis with SQL','Perform comprehensive data analysis on a fictional university enrollment dataset using advanced SQL queries.','Write analytical SQL queries to answer business questions, create views for reporting, and visualize key findings.','BEGINNER','2026-10-28','BOTH','PUBLISHED',['PostgreSQL','JavaScript']],
  ['Network Monitoring Fundamentals','Set up a network monitoring solution for a fictional campus network and create alerting rules.','Configure monitoring agents, set up dashboards, define alert thresholds, and document the monitoring strategy.','INTERMEDIATE','2026-10-30','FILE_UPLOAD','DRAFT',['Linux','Node.js']],
] as const;
const rubric = [{name:'Functionality',weight:40},{name:'Code Quality',weight:20},{name:'Documentation',weight:20},{name:'Problem Solving',weight:20}];
const submissions = [
  ['MIT-26-CS-041',0,'2026-10-14','EVALUATED',88,'https://github.com/aarav.karki/campus-api','A RESTful API for campus resource management with JWT auth, role-based access control, and full CRUD endpoints.','Strong API structure and good database integration. Improve error handling consistency and API documentation.'],
  ['MIT-26-CS-052',0,'2026-10-15','UNDER_REVIEW',null,'https://github.com/nisha.thapa/campus-api','REST API with Express, PostgreSQL, input validation, and Swagger documentation.',null],
  ['MIT-25-CS-033',0,'2026-10-16','SUBMITTED',null,'https://github.com/rohan.shrestha/campus-resource-api','Campus resource management API with authentication and CRUD operations.',null],
  ['MIT-25-IT-019',1,'2026-09-28','EVALUATED',84,'https://github.com/sanjay.adhikari/db-optimization','Query analysis and index optimization for e-commerce database with before/after performance metrics.','Good index strategy and clear query analysis. Documentation could be more detailed on optimization rationale.'],
  ['MIT-26-CS-067',2,'2026-10-10','EVALUATED',92,'https://github.com/priya.basnet/react-components','A reusable React component library with TypeScript, accessibility, and Storybook stories.','Excellent component design and thorough documentation.'],
  ['MIT-26-CS-041',1,'2026-09-28','EVALUATED',91,'https://github.com/aarav.karki/sql-optimization','Comprehensive SQL optimization with index design, query rewrites, and performance benchmarking.','Outstanding performance analysis and index design.'],
  ['MIT-26-CS-052',2,'2026-10-12','UNDER_REVIEW',null,'https://github.com/nisha.thapa/react-lib','Component library with TypeScript generics, custom hooks, and comprehensive Storybook.',null],
  ['MIT-25-IT-028',4,'2026-10-08','SUBMITTED',null,null,'SQL analysis scripts for university enrollment data with summary views.',null],
] as const;
const studentSkills: Record<string, [string, number, SkillLevel][]> = {
  'MIT-26-CS-041': [['Node.js',88,'INTERMEDIATE'],['Express.js',84,'INTERMEDIATE'],['PostgreSQL',91,'ADVANCED'],['React',72,'INTERMEDIATE'],['Git',86,'INTERMEDIATE']],
  'MIT-26-CS-052': [['React',92,'ADVANCED'],['TypeScript',88,'ADVANCED'],['JavaScript',85,'ADVANCED'],['Git',84,'INTERMEDIATE']],
  'MIT-25-CS-033': [['Linux',82,'INTERMEDIATE'],['Node.js',76,'INTERMEDIATE'],['Git',88,'ADVANCED'],['PostgreSQL',74,'INTERMEDIATE']],
  'MIT-25-IT-019': [['REST API',86,'ADVANCED'],['Express.js',80,'INTERMEDIATE'],['JavaScript',78,'INTERMEDIATE'],['Git',82,'INTERMEDIATE']],
  'MIT-26-CS-067': [['TypeScript',93,'ADVANCED'],['React',89,'ADVANCED'],['Node.js',85,'ADVANCED'],['PostgreSQL',88,'ADVANCED']],
  'MIT-25-IT-028': [['JavaScript',72,'INTERMEDIATE'],['Git',78,'INTERMEDIATE'],['Linux',70,'INTERMEDIATE']],
};

async function main() {
  const passwordHash = await bcrypt.hash('StudentHub@123', 10);
  await prisma.college.upsert({ where: { email: 'admin@meridian.edu' }, update: {}, create: { name: 'Meridian Institute of Technology', email: 'admin@meridian.edu', passwordHash, location: 'Kathmandu, Nepal' } });
  const skills = new Map<string,string>();
  for (const [name, category] of skillData) {
    const s = await prisma.skill.upsert({ where: { name }, update: { category: category as SkillCategory }, create: { name, category: category as SkillCategory } });
    skills.set(name, s.id);
  }
  const students = new Map<string,string>();
  for (const [studentId,name,batch,department,status] of studentData) {
    const s = await prisma.student.upsert({ where: { studentId }, update: { name,batch,department,status: status as StudentStatus }, create: { studentId,name,batch,department,status: status as StudentStatus } });
    students.set(studentId,s.id);
  }
  const college = await prisma.college.findUniqueOrThrow({ where: { email: 'admin@meridian.edu' } });
  const challengeIds: string[] = [];
  for (const [title,description,instructions,difficulty,deadline,submissionType,status,names] of challenges) {
    const existing = await prisma.challenge.findFirst({ where: { title } });
    const c = existing ?? await prisma.challenge.create({ data: { collegeId: college.id,title,description,instructions,difficulty: difficulty as Difficulty,deadline:new Date(deadline+'T23:59:59Z'),submissionType:submissionType as SubmissionType,status:status as ChallengeStatus,rubric } });
    challengeIds.push(c.id);
    for (const name of names) { const skillId=skills.get(name); if(skillId) await prisma.challengeSkill.upsert({where:{challengeId_skillId:{challengeId:c.id,skillId}},update:{},create:{challengeId:c.id,skillId}}); }
  }
  for (const [studentId,challengeIndex,submittedAt,status,score,githubLink,description,feedback] of submissions) {
    const sId = students.get(studentId)!; const challengeId = challengeIds[challengeIndex];
    const sub = await prisma.submission.upsert({ where:{studentId_challengeId:{studentId:sId,challengeId}}, update:{status:status as SubmissionStatus,score,githubLink,description,feedback}, create:{studentId:sId,challengeId,status:status as SubmissionStatus,score,githubLink,description,feedback,createdAt:new Date(submittedAt+'T12:00:00Z')} });
    if (score !== null) await prisma.evaluation.upsert({where:{submissionId:sub.id},update:{functionality:Math.round(score*.4),codeQuality:Math.round(score*.2),documentation:Math.round(score*.2),problemSolving:score-Math.round(score*.4)-Math.round(score*.2)-Math.round(score*.2),total:score,feedback,verified:true},create:{submissionId:sub.id,functionality:Math.round(score*.4),codeQuality:Math.round(score*.2),documentation:Math.round(score*.2),problemSolving:score-Math.round(score*.4)-Math.round(score*.2)-Math.round(score*.2),total:score,feedback,verified:true}});
  }
  for (const [studentId, rows] of Object.entries(studentSkills)) for (const [skillName,score,level] of rows) { const studentIdDb=students.get(studentId)!; const skillId=skills.get(skillName)!; await prisma.studentSkill.upsert({where:{studentId_skillId:{studentId:studentIdDb,skillId}},update:{score,level},create:{studentId:studentIdDb,skillId,score,level}}); }
  console.log('StudentHub seed complete. Demo college: admin@meridian.edu / StudentHub@123');
}
main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
