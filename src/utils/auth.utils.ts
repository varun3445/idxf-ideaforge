
import { supabase } from '../integrations/supabase/client';
import { User } from '../types/auth.types';

// Helper function to generate a random value
function getRandomValue(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate a random hex color
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    console.log(`Fetching profile for user ${userId}`);
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name, email, location, sex')
      .eq('id', userId as any)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }
    
    console.log('Profile data retrieved:', profileData);
    
    // Get user skills
    const { data: skillsData, error: skillsError } = await supabase
      .from('user_skills')
      .select('skills(name)')
      .eq('user_id', userId as any);
      
    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
    }
    
    const skills = skillsData ? skillsData.map(item => ((item.skills as any)?.name || '')) : [];
    console.log(`Retrieved ${skills.length} skills for user`);
    
    return {
      id: userId,
      name: profileData?.name || '',
      email: profileData?.email || '',
      location: profileData?.location || '',
      sex: profileData?.sex || 'male',
      skills: skills.filter(Boolean) // Filter out any undefined values
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}

export async function createUserSkill(userId: string, skillName: string): Promise<boolean> {
  try {
    console.log(`Creating skill "${skillName}" for user ${userId}`);
    // First check if the skill exists
    const { data: existingSkill, error: skillFetchError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName as any)
      .single();
    
    if (skillFetchError && skillFetchError.code !== 'PGRST116') {
      console.error(`Error checking skill ${skillName}:`, skillFetchError);
      return false;
    }
    
    let skillId;
    if (existingSkill) {
      skillId = existingSkill.id;
      console.log(`Skill "${skillName}" already exists with ID ${skillId}`);
    } else {
      // If the skill doesn't exist, we need to create it with a default color
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      const { data: newSkill, error: newSkillError } = await supabase
        .from('skills')
        .insert({
          name: skillName,
          color: randomColor
        } as any)
        .select('id')
        .single();
        
      if (newSkillError) {
        console.error(`Error creating skill ${skillName}:`, newSkillError);
        return false;
      }
      
      skillId = newSkill?.id;
      console.log(`Created new skill "${skillName}" with ID ${skillId}`);
    }
    
    // Check if this user-skill association already exists
    const { data: existingUserSkill, error: checkUserSkillError } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', userId as any)
      .eq('skill_id', skillId)
      .maybeSingle();
      
    if (checkUserSkillError) {
      console.error(`Error checking if user skill already exists:`, checkUserSkillError);
    }
    
    if (existingUserSkill) {
      console.log(`User already has skill "${skillName}"`);
      return true;
    }
    
    // Now insert the user-skill association
    const { error: userSkillError } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        skill_id: skillId,
      } as any);
      
    if (userSkillError) {
      console.error(`Error adding skill ${skillName}:`, userSkillError);
      return false;
    }
    
    console.log(`Successfully added skill "${skillName}" to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in createUserSkill:', error);
    return false;
  }
}

// New function to generate and register multiple users
export async function generateMultipleUsers(count: number = 25): Promise<boolean> {
  try {
    console.log(`Starting to generate ${count} users...`);
    
    const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'David', 'Sophia', 'James', 'Olivia', 'Robert', 'Ava', 
                        'William', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Charles', 'Amelia', 
                        'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Anthony', 'Abigail', 'Donald', 'Emily'];
    
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 
                      'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 
                      'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];
    
    const locations = ['New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA', 
                      'London, UK', 'Berlin, Germany', 'Paris, France', 'Rome, Italy', 'Madrid, Spain', 
                      'Tokyo, Japan', 'Beijing, China', 'Mumbai, India', 'Sydney, Australia', 'Toronto, Canada',
                      'Mexico City, Mexico', 'Rio de Janeiro, Brazil', 'Cairo, Egypt', 'Lagos, Nigeria', 'Cape Town, South Africa'];
    
    const sexOptions = ['male', 'female'];
    
    const skillsList = [
      'UX Design', 'UI Design', 'Frontend Development', 'Backend Development', 'Product Management',
      'Marketing', 'Content Writing', 'Graphic Design', '3D Modeling', 'Video Editing',
      'Animation', 'Illustration', 'Sound Design', 'Game Development', 'Data Science',
      'Machine Learning', 'Mobile Development', 'DevOps', 'Cloud Architecture', 'Blockchain',
      'AR/VR Development', 'SEO', 'Social Media Marketing', 'Project Management', 'Quality Assurance'
    ];
    
    // Create skills first if they don't exist
    for (const skillName of skillsList) {
      const { data, error } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName as any)
        .single();
        
      if (error && error.code === 'PGRST116') {
        const randomColor = getRandomColor();
        await supabase
          .from('skills')
          .insert({ name: skillName, color: randomColor } as any);
        console.log(`Created skill: ${skillName} with color: ${randomColor}`);
      }
    }
    
    // Generate and create users
    for (let i = 0; i < count; i++) {
      const firstName = getRandomValue(firstNames);
      const lastName = getRandomValue(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const password = 'Password123!'; // Simple password for test users
      const location = getRandomValue(locations);
      const sex = getRandomValue(sexOptions);
      
      // Select 3-5 random skills for this user
      const numSkills = Math.floor(Math.random() * 3) + 3; // 3 to 5 skills
      const userSkills = [];
      const shuffledSkills = [...skillsList].sort(() => 0.5 - Math.random());
      
      for (let j = 0; j < numSkills; j++) {
        userSkills.push(shuffledSkills[j]);
      }
      
      console.log(`Creating user ${i+1}/${count}: ${name} with ${userSkills.length} skills`);
      
      // Create the user auth entry
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error(`Error creating auth for ${name}:`, authError);
        continue;
      }
      
      if (authData.user) {
        const userId = authData.user.id;
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name,
            email,
            location,
            sex
          } as any);
          
        if (profileError) {
          console.error(`Error creating profile for ${name}:`, profileError);
          continue;
        }
        
        // Add skills for user
        for (const skill of userSkills) {
          await createUserSkill(userId, skill);
        }
        
        console.log(`Successfully created user ${name} with ID ${userId}`);
      }
    }
    
    console.log(`Completed generating ${count} users`);
    return true;
  } catch (error) {
    console.error('Error generating multiple users:', error);
    return false;
  }
}
