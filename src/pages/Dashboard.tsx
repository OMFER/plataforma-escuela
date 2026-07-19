import { APP_TEXTS } from '../constants/texts';
import { USER, COURSES } from '../constants/mockData';
import { CourseCard } from '../components/dashboard/CourseCard';
// import { Layout } from '../components/layout/Layout'; // Asumiendo que tu Layout envuelve la vista

export const Dashboard = () => {
  return (
    <main className="min-h-screen">
      <div className="max-w-[1200px] mx-auto p-gutter space-y-section-gap">

        {/* Greeting */}
        <section className="space-y-2">
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary">
            {APP_TEXTS.dashboard.greeting}, {USER.fullName}!
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            {APP_TEXTS.dashboard.greetingSubtitle}
          </p>
        </section>

        {/* Bento Layout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {COURSES.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Right Column (Widgets) */}
          <div className="space-y-6">
            {/* Aquí iría tu NewsWidget.jsx */}
          </div>

        </div>
      </div>
    </main>
  );
};