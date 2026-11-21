-- CareBridge Migration: Audit Logging Coverage and Activity Log RPC
-- Description:
-- 1. Updates admin_create_volunteer_task to log VOLUNTEER_TASK_CREATED in public.admin_activity_logs
-- 2. Adds admin_get_activity_logs RPC function for authorized Admins to inspect logs with resolved names

-- 1. Update admin_create_volunteer_task to include audit logging
CREATE OR REPLACE FUNCTION public.admin_create_volunteer_task(
  p_volunteer_id UUID,
  p_patient_id UUID,
  p_task_description TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is an authorized Admin
  IF NOT EXISTS (
    SELECT 1
    FROM public.authorized_admins
    WHERE admin_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Verify Volunteer is approved
  IF NOT EXISTS (
    SELECT 1 FROM public.authorized_volunteers
    WHERE volunteer_id = p_volunteer_id
  ) THEN
    RAISE EXCEPTION 'Volunteer is not approved';
  END IF;

  -- Verify Patient account
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_patient_id
      AND raw_user_meta_data ->> 'role' = 'Patient'
  ) THEN
    RAISE EXCEPTION 'Selected user is not a Patient';
  END IF;

  IF NULLIF(TRIM(p_task_description), '') IS NULL THEN
    RAISE EXCEPTION 'Task description is required';
  END IF;

  -- Insert the task
  INSERT INTO public.volunteer_tasks (
    volunteer_id,
    patient_id,
    task_description
  )
  VALUES (
    p_volunteer_id,
    p_patient_id,
    TRIM(p_task_description)
  );

  -- Record Admin audit activity
  PERFORM public.admin_log_activity(
    'VOLUNTEER_TASK_CREATED',
    p_patient_id,
    'Volunteer',
    jsonb_build_object(
      'volunteer_id', p_volunteer_id,
      'patient_id', p_patient_id,
      'task_description', TRIM(p_task_description)
    )
  );

  RETURN 'Volunteer task created successfully';
END;
$$;

-- 2. Create admin_get_activity_logs RPC for efficient, authorized audit log retrieval with resolved names
CREATE OR REPLACE FUNCTION public.admin_get_activity_logs(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  log_id UUID,
  admin_id UUID,
  admin_name TEXT,
  action TEXT,
  target_user_id UUID,
  target_name TEXT,
  target_role TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is an authorized Admin
  IF NOT EXISTS (
    SELECT 1
    FROM public.authorized_admins
    WHERE admin_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    l.id AS log_id,
    l.admin_id,
    COALESCE(aa.admin_name, 'CareBridge Admin')::TEXT AS admin_name,
    l.action,
    l.target_user_id,
    COALESCE(
      NULLIF(p.full_name, ''),
      NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(l.details ->> 'full_name', ''),
      NULLIF(l.details ->> 'email', ''),
      'User'
    )::TEXT AS target_name,
    l.target_role,
    l.details,
    l.created_at
  FROM public.admin_activity_logs AS l
  LEFT JOIN public.authorized_admins AS aa
    ON aa.admin_id = l.admin_id
  LEFT JOIN auth.users AS u
    ON u.id = l.target_user_id
  LEFT JOIN public.profiles AS p
    ON p.id = l.target_user_id
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
