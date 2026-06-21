# Deploying the Food Ordering System on Render

This guide outlines the steps to deploy both the **Spring Boot backend** and the **React frontend** to [Render](https://render.com) using the Blueprint specification we created.

---

## Prerequisites
1. A **GitHub account**
2. A **Render account** (free tier is perfect)
3. A **Neon PostgreSQL database** (you already have this!)

---

## Step 1: Initialize Git inside the project directory

Currently, git is initialized in your home directory rather than the project folder. Let's initialize a dedicated git repository for the project:

Open your terminal, navigate to the project root directory, and run:

```bash
# Navigate to the project root
cd "c:\Users\Rishabh Agrawal\Desktop\food-ordering-system"

# Initialize a new Git repository
git init

# Create a .gitignore in the root (if not present) to ignore node_modules and target builds
echo "node_modules/
build/
.env
backend/target/
backend/.mvn/
.DS_Store" > .gitignore

# Stage all files
git add .

# Create the initial commit
git commit -m "feat: setup full-stack app with Render deployment blueprint"
```

---

## Step 2: Push the code to GitHub

1. Go to [GitHub](https://github.com) and click **New Repository**.
2. Name it (e.g., `food-ordering-system`) and keep it **Public** or **Private**. Do **not** initialize it with a README, gitignore, or license.
3. Copy the remote repository URL (looks like `https://github.com/your-username/food-ordering-system.git`).
4. Run the following commands in your project terminal to link and push your code:

```bash
# Rename default branch to main
git branch -M main

# Add the remote repository URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/REPOSITORY_NAME.git

# Push the code
git push -u origin main
```

---

## Step 3: Deploy to Render using Blueprints

Render's Blueprints automatically read our `render.yaml` file to provision the services.

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top right and select **Blueprint**.
3. Connect your GitHub account and select your `food-ordering-system` repository.
4. Render will read the `render.yaml` configuration and list the services it will create:
   - **`food-ordering-system-backend`** (Web Service via Docker)
   - **`food-ordering-system-frontend`** (Static Site)
5. You will be prompted to fill in the missing environment variables for the **backend service**:
   - `DB_URL`: `jdbc:postgresql://ep-hidden-cake-ahlitx9o-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - `DB_USERNAME`: `neondb_owner`
   - `DB_PASSWORD`: `npg_miTzLjKpqW89`
   - `RAZORPAY_KEY_ID`: `rzp_test_T4NIVl6IbCXeRp`
   - `RAZORPAY_KEY_SECRET`: `YeEBnWp8TvZUfkB6kxhxMUTh`
   - `CLOUDINARY_CLOUD_NAME`: `dar5jjqdu`
   - `CLOUDINARY_API_KEY`: `279345723247382`
   - `CLOUDINARY_API_SECRET`: `l3YDGdc-mPB1fbMw8MOU2p75Zss`
   *(The `JWT_SECRET` variable will be automatically generated with a secure random value by Render)*
6. Click **Apply**.

---

## Step 4: Access your Application

Render will build and deploy both services:
1. **Backend**: Render compiles the Java source code inside the Docker builder and runs the container. The URL will look like: `https://food-ordering-system-backend.onrender.com`.
2. **Frontend**: Render automatically builds the React production bundle, injects the backend URL as the API endpoint, and deploys it as a static site. The URL will look like: `https://food-ordering-system-frontend.onrender.com`.

Once both builds are green, open the frontend URL and start ordering!
