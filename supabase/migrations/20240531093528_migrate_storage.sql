revoke select on table "storage"."s3_multipart_uploads" from "anon";

revoke select on table "storage"."s3_multipart_uploads" from "authenticated";

revoke delete on table "storage"."s3_multipart_uploads" from "service_role";

revoke insert on table "storage"."s3_multipart_uploads" from "service_role";

revoke references on table "storage"."s3_multipart_uploads" from "service_role";

revoke select on table "storage"."s3_multipart_uploads" from "service_role";

revoke trigger on table "storage"."s3_multipart_uploads" from "service_role";

revoke truncate on table "storage"."s3_multipart_uploads" from "service_role";

revoke update on table "storage"."s3_multipart_uploads" from "service_role";

revoke select on table "storage"."s3_multipart_uploads_parts" from "anon";

revoke select on table "storage"."s3_multipart_uploads_parts" from "authenticated";

revoke delete on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke insert on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke references on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke select on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke trigger on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke truncate on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke update on table "storage"."s3_multipart_uploads_parts" from "service_role";

alter table "storage"."s3_multipart_uploads" drop constraint "s3_multipart_uploads_bucket_id_fkey";

alter table "storage"."s3_multipart_uploads_parts" drop constraint "s3_multipart_uploads_parts_bucket_id_fkey";

alter table "storage"."s3_multipart_uploads_parts" drop constraint "s3_multipart_uploads_parts_upload_id_fkey";

drop function if exists "storage"."list_multipart_uploads_with_delimiter"(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);

drop function if exists "storage"."list_objects_with_delimiter"(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);

alter table "storage"."s3_multipart_uploads" drop constraint "s3_multipart_uploads_pkey";

alter table "storage"."s3_multipart_uploads_parts" drop constraint "s3_multipart_uploads_parts_pkey";

drop index if exists "storage"."idx_multipart_uploads_list";

drop index if exists "storage"."idx_objects_bucket_id_name";

drop index if exists "storage"."s3_multipart_uploads_parts_pkey";

drop index if exists "storage"."s3_multipart_uploads_pkey";

drop table "storage"."s3_multipart_uploads";

drop table "storage"."s3_multipart_uploads_parts";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(regexp_split_to_array(objects.name, ''/''), 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(regexp_split_to_array(objects.name, ''/''), 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;

create policy "Enable insert for authenticated users only"
on "storage"."buckets"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow authenticated users to upload"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((auth.uid() IS NOT NULL));


create policy "delete_recipes_images"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'recipes_images'::text));


create policy "select_recipes_images"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'recipes_images'::text));



