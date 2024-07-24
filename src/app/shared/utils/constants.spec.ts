import { Constants } from "./constants";

describe('Constants', () => {
  it('should have a valid email validation regex', () => {
    const emailRegex = Constants.emailValidationRegex;
    const validEmails = [
      'test@example.com',
      'john.doe@gmail.com',
      'jane_doe123@yahoo.co.uk',
      'user-name@example-domain.com',
    ];
    const invalidEmails = [
      'invalidemail',
      'test@example.'
    ];

    validEmails.forEach((email) => {
      expect(email.match(emailRegex)).toBeTruthy();
    });

    invalidEmails.forEach((email) => {
      expect(email.match(emailRegex)).toBeNull();
    });
  });
});