import bcrypt from 'bcryptjs';

(async () => {
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('============= hashedPassword =============');
    console.log(hashedPassword);
})();


(async () => {
    const storedPassword = '$2a$10$/pDTQhk8zmlF9qRi0F5p6uCrmqgPTZMpjHWuJaIC.34RbCvEP80qC';
    const inputPassword = '12345678';
    
    const isMatch = await bcrypt.compare(inputPassword, storedPassword);
    
    console.log('============= Passwords match =============');
    console.log(isMatch);
})();
