use crate::schema::todos;
use diesel::prelude::*;
use chrono::NaiveDate;
use serde::Serialize;


#[derive(Debug,Queryable,Serialize)]
#[diesel(table_name = crate::schema::todo)]
pub struct Todo {
    pub id: i32,
    pub event_date: String,
    pub event_tasks: String,
}
