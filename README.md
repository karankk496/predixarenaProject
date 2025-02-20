## 1. Clone the Repository

```bash
git clone -b merged https://github.com/karankk496/predixarenaProject.git
cd predixarenaProject
```
## 2. Setup Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yourdbname"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/anotherdbnameforbackup"
JWT_SECRET="yoursecret key"
JWT_EXPIRATION_TIME=3600

# OAuth Providers (Uncomment and set values as needed)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GITHUB_ID="your-github-client-id"
# GITHUB_SECRET="your-github-client-secret"
# TWITTER_CLIENT_ID="your-twitter-client-id"
# TWITTER_CLIENT_SECRET="your-twitter-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your secretkey"
```
## 3. Install Dependencies

```bash
npm install
```
## 4. Setup Database with Prisma

```bash
npx prisma migrate dev 
```
## 5. Start the Development Server

```bash
npm run dev
```
The project will be running at http://localhost:3000.

To see, the database on interactive UI, run below command

```bash
npx prisma studio
```
The UI will be running at http://localhost:5555.



**For Admin:**  
- Can create new events.  
- Can approve or reject events submitted by general users.  
- Can view the list of all users in the system.  
- Can manage user roles and permissions.  
- Can monitor event participation and voting statistics.  

**For General Users:**  
- Can create new events.  
- Can vote on available events.  
- Can view their own votes, with the option to filter by event.  


