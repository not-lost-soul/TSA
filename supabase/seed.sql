-- Seed only the required one-day course. Classes and subjects intentionally remain empty.
insert into public.exam_courses (slug,title,description,fee,duration_label,exams,cta_label)
values ('one-day-competitive-exam-preparation','One-day competitive exam preparation','A focused one-day introduction to competitive exams, their formats, pathways, and preparation approaches.',null,'One day',array['JEE','NEET','CET','CUET','UPSC','Other competitive exams'],'Make an inquiry')
on conflict (slug) do nothing;
