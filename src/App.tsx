import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/layout/PublicLayout'
import { AdminLayout, RequireAdmin } from './components/admin/AdminLayout'
import { SectionLoader } from './components/ui'

// Public pages load eagerly enough to feel instant; admin is split out so
// visitors never download the dashboard bundle.
import Home from './pages/Home'

const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'))
const AdminExperience = lazy(() => import('./pages/admin/AdminExperience'))
const AdminEducation = lazy(() => import('./pages/admin/AdminEducation'))
const AdminServices = lazy(() => import('./pages/admin/AdminServices'))
const AdminSocialLinks = lazy(() => import('./pages/admin/AdminSocialLinks'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

export default function App() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="experience" element={<AdminExperience />} />
            <Route path="education" element={<AdminEducation />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="social-links" element={<AdminSocialLinks />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
