import { test } from '@japa/runner'
import sinon from 'sinon'
import { OpenAIService } from '#services/openai_service'
import env from '#start/env'
import type { ExtractedCvData } from '#services/openai_service'
import {
  OpenAIMockManager,
  mockExtractedCvData,
  mockMinimalCvData,
  sampleCvTexts,
} from '#tests/utils/openai_mocks'

test.group('OpenAI Service CV Data Scenarios', (group) => {
  let mockManager: OpenAIMockManager

  group.setup(() => {
    mockManager = new OpenAIMockManager()
  })

  group.teardown(() => {
    mockManager.restore()
  })

  group.each.teardown(() => {
    mockManager.restore()
  })

  test('should handle CV with extensive work experience', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Create CV data with multiple work experiences
    const extensiveWorkCvData: ExtractedCvData = {
      ...mockExtractedCvData,
      WorkExperience: [
        {
          Company: 'TechCorp Inc',
          JobTitle: 'Senior Software Engineer',
          Duration: '2020-01 to Present',
          Description: 'Lead development of microservices architecture',
          KeyAchievements: 'Improved system performance by 60%',
        },
        {
          Company: 'StartupXYZ',
          JobTitle: 'Full Stack Developer',
          Duration: '2018-06 to 2019-12',
          Description: 'Built web applications using React and Node.js',
          KeyAchievements: 'Delivered 5 major features ahead of schedule',
        },
        {
          Company: 'ConsultingABC',
          JobTitle: 'Junior Developer',
          Duration: '2016-08 to 2018-05',
          Description: 'Maintained legacy systems and built new features',
          KeyAchievements: 'Reduced bug reports by 40%',
        },
      ],
      YearExperience: 7,
    }
    
    const mockStub = mockManager.mockSuccessfulResponse(extensiveWorkCvData, 2500)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.WorkExperience.length, 3)
    assert.equal(result.data!.YearExperience, 7)
    assert.equal(result.tokensUsed, 2500)
  })

  test('should handle CV with multiple education entries', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Create CV data with multiple education entries
    const multiEducationCvData: ExtractedCvData = {
      ...mockExtractedCvData,
      Education: [
        {
          School: 'University of Technology',
          Major: 'Computer Science',
          DegreeLevel: 'Master',
          StartDate: '2014-09',
          EndDate: '2016-06',
          GPA: '3.9',
        },
        {
          School: 'Community College',
          Major: 'Information Technology',
          DegreeLevel: 'Associate',
          StartDate: '2012-09',
          EndDate: '2014-06',
          GPA: '3.7',
        },
      ],
    }
    
    const mockStub = mockManager.mockSuccessfulResponse(multiEducationCvData, 1800)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.Education.length, 2)
    assert.equal(result.data!.Education[0].DegreeLevel, 'Master')
    assert.equal(result.data!.Education[1].DegreeLevel, 'Associate')
  })

  test('should handle CV with extensive skills and certifications', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Create CV data with extensive skills
    const skillsHeavyCvData: ExtractedCvData = {
      ...mockExtractedCvData,
      Skills: {
        Technical: [
          'JavaScript', 'TypeScript', 'Python', 'Java', 'C++',
          'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js',
          'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
          'AWS', 'Azure', 'GCP', 'Jenkins', 'Git',
        ],
        Soft: [
          'Leadership', 'Communication', 'Problem Solving',
          'Team Collaboration', 'Project Management', 'Mentoring',
          'Public Speaking', 'Critical Thinking', 'Adaptability',
        ],
      },
      Certifications: [
        {
          Name: 'AWS Certified Solutions Architect',
          Issuer: 'Amazon Web Services',
          DateIssued: '2021-03',
          ExpirationDate: '2024-03',
        },
        {
          Name: 'Certified Kubernetes Administrator',
          Issuer: 'Cloud Native Computing Foundation',
          DateIssued: '2020-11',
          ExpirationDate: '2023-11',
        },
        {
          Name: 'Google Cloud Professional Developer',
          Issuer: 'Google Cloud',
          DateIssued: '2021-08',
          ExpirationDate: '2023-08',
        },
      ],
      TechnologyExperience: [
        'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js',
        'PostgreSQL', 'Docker', 'AWS', 'Kubernetes',
      ],
    }
    
    const mockStub = mockManager.mockSuccessfulResponse(skillsHeavyCvData, 3000)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.isAtLeast(result.data!.Skills.Technical.length, 15)
    assert.isAtLeast(result.data!.Skills.Soft.length, 5)
    assert.equal(result.data!.Certifications.length, 3)
    assert.include(result.data!.Skills.Technical, 'Kubernetes')
    assert.include(result.data!.Certifications[0].Name, 'AWS')
  })

  test('should handle CV with international experience', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Create CV data with international elements
    const internationalCvData: ExtractedCvData = {
      ...mockExtractedCvData,
      PersonalInformation: {
        Name: 'Maria González',
        DateOfBirth: '1988-12-03',
        Gender: 'female',
        PhoneNumber: '+34-123-456-789',
        Email: 'maria.gonzalez@email.com',
        Address: 'Calle Mayor 123, Madrid, Spain',
      },
      Languages: [
        {
          Name: 'Spanish',
          Proficiency: 'Native',
        },
        {
          Name: 'English',
          Proficiency: 'Fluent',
        },
        {
          Name: 'French',
          Proficiency: 'Intermediate',
        },
        {
          Name: 'German',
          Proficiency: 'Basic',
        },
      ],
      WorkExperience: [
        {
          Company: 'European Tech Solutions',
          JobTitle: 'International Project Manager',
          Duration: '2019-01 to Present',
          Description: 'Managed cross-border software development projects',
          KeyAchievements: 'Successfully delivered projects in 8 countries',
        },
      ],
    }
    
    const mockStub = mockManager.mockSuccessfulResponse(internationalCvData, 2200)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.PersonalInformation.Name, 'Maria González')
    assert.equal(result.data!.Languages.length, 4)
    assert.include(result.data!.Languages[0].Name, 'Spanish')
    assert.include(result.data!.PersonalInformation.Address!, 'Spain')
  })

  test('should handle CV with project-heavy background', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Create CV data with multiple projects
    const projectHeavyCvData: ExtractedCvData = {
      ...mockExtractedCvData,
      Projects: [
        {
          ProjectName: 'E-commerce Platform',
          Role: 'Lead Developer',
          Description: 'Built scalable e-commerce platform handling 50k+ daily users',
          Technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
        },
        {
          ProjectName: 'Mobile Banking App',
          Role: 'Senior Developer',
          Description: 'Developed secure mobile banking application',
          Technologies: ['React Native', 'TypeScript', 'Firebase', 'Stripe API'],
        },
        {
          ProjectName: 'Data Analytics Dashboard',
          Role: 'Full Stack Developer',
          Description: 'Created real-time analytics dashboard for business intelligence',
          Technologies: ['Vue.js', 'Python', 'FastAPI', 'MongoDB', 'Chart.js'],
        },
        {
          ProjectName: 'IoT Monitoring System',
          Role: 'Backend Developer',
          Description: 'Built IoT device monitoring and control system',
          Technologies: ['Node.js', 'MQTT', 'InfluxDB', 'Grafana', 'Docker'],
        },
      ],
    }
    
    const mockStub = mockManager.mockSuccessfulResponse(projectHeavyCvData, 2800)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.Projects.length, 4)
    assert.include(result.data!.Projects[0].ProjectName, 'E-commerce')
    assert.include(result.data!.Projects[1].Technologies, 'React Native')
    assert.include(result.data!.Projects[2].Role, 'Full Stack')
  })

  test('should handle CV with minimal information', async ({ assert }) => {
    const service = new OpenAIService()
    
    const mockStub = mockManager.mockSuccessfulResponse(mockMinimalCvData, 400)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.minimal)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.equal(result.data!.PersonalInformation.Name, 'Jane Smith')
    assert.equal(result.data!.Education.length, 0)
    assert.equal(result.data!.WorkExperience.length, 0)
    assert.equal(result.data!.Skills.Technical.length, 0)
    assert.equal(result.data!.Skills.Soft.length, 0)
    assert.isNull(result.data!.YearExperience)
    assert.equal(result.tokensUsed, 400)
  })

  test('should handle CV with academic background', async ({ assert }) => {
    const service = new OpenAIService()
    
    // Create CV data with academic focus
    const academicCvData: ExtractedCvData = {
      ...mockExtractedCvData,
      PersonalInformation: {
        Name: 'Dr. Sarah Johnson',
        DateOfBirth: '1985-03-15',
        Gender: 'female',
        PhoneNumber: '+1-555-0199',
        Email: 'sarah.johnson@university.edu',
        Address: '456 University Ave, Academic City, State 67890',
      },
      Education: [
        {
          School: 'Stanford University',
          Major: 'Computer Science',
          DegreeLevel: 'PhD',
          StartDate: '2010-09',
          EndDate: '2015-06',
          GPA: '3.95',
        },
        {
          School: 'MIT',
          Major: 'Computer Science',
          DegreeLevel: 'Master',
          StartDate: '2008-09',
          EndDate: '2010-06',
          GPA: '3.9',
        },
      ],
      WorkExperience: [
        {
          Company: 'University Research Lab',
          JobTitle: 'Research Scientist',
          Duration: '2015-07 to Present',
          Description: 'Conducting research in machine learning and AI',
          KeyAchievements: 'Published 15 peer-reviewed papers, secured $2M in grants',
        },
      ],
      Certifications: [],
      Projects: [
        {
          ProjectName: 'Neural Network Optimization',
          Role: 'Principal Investigator',
          Description: 'Research project on optimizing deep neural networks',
          Technologies: ['Python', 'TensorFlow', 'PyTorch', 'CUDA'],
        },
      ],
      YearExperience: 8,
      CareerPath: 'Academic research in artificial intelligence and machine learning',
    }
    
    const mockStub = mockManager.mockSuccessfulResponse(academicCvData, 2100)
    ;(service as any).client.chat.completions.create = mockStub

    const result = await service.extractCvData(sampleCvTexts.comprehensive)

    assert.isTrue(result.success)
    assert.isDefined(result.data)
    assert.include(result.data!.PersonalInformation.Name, 'Dr.')
    assert.equal(result.data!.Education[0].DegreeLevel, 'PhD')
    assert.include(result.data!.WorkExperience[0].JobTitle!, 'Research')
    assert.include(result.data!.CareerPath!, 'Academic research')
  })
})
