# ARTEMIS WEB CONSOLE - SAMPLE

# Authentication
Currently auth is not enforced by domains, Active Directories or by any other restrictions so any user can create their own accounts and access the site.

### Testing URL(Live Link):
https://main.d3adydml7r2i0r.amplifyapp.com

## Improvements to be Considered:
- This code needs to be revamped for security, no time-restricted authentication is present.
- Purely dependent on Firebase Auth - Lacks MFA. 
- The Contents are not fetched from a Cache/CDN will have to deploy in CDN to ensure fast loading.
