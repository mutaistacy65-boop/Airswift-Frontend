#!/bin/bash
PROTECTION_CODE="
export async function getServerSideProps(context: any) {
  const { req } = context;
  const token = req.cookies.token || req.cookies.accessToken;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}"

for file in src/pages/admin/interviews.tsx src/pages/admin/settings.tsx src/pages/admin/messages.tsx src/pages/admin/categories.tsx src/pages/admin/jobs.tsx src/pages/admin/audit-logs.tsx src/pages/admin/email-templates-manager.tsx src/pages/admin/users.tsx src/pages/admin/email-templates.tsx src/pages/admin/health.tsx src/pages/admin/payments.tsx src/pages/admin/applications.tsx src/pages/admin/applications-list.tsx src/pages/admin/audit.tsx; do
  echo "$PROTECTION_CODE" >> "$file"
done

echo "Protection added to all admin pages"
