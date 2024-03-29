#![feature(decl_macro)]
#[allow(unused_imports)]
#[macro_use]
extern crate rocket;
#[macro_use]
extern crate rocket_contrib;
#[macro_use]
extern crate diesel;

use rocket::data::Outcome;
use std::env;
use rocket::serde::json::Json;
use rocket::fs::FileServer;
use rocket::response::content::RawHtml;
use dotenv::dotenv;
use std::fs;
use rocket::{Request, Rocket, Build};
use rocket::fairing::AdHoc;
use serde::Deserialize;
use rocket::http::Status; // Add this import

use crate::models::*;
use crate::schema::*;
use diesel::pg::PgConnection;
use diesel::prelude::*;


pub mod models;
pub mod schema;

fn load_template(template_name: &str) -> RawHtml<String> {
    let template_path = format!("templates/{}.html", template_name);
    let template_content = fs::read_to_string(&template_path)
        .expect(&format!("Unable to read file: {}", template_path));
    RawHtml(template_content)
}

fn create(connection: &PgConnection) { // Remove mut from connection
    let new_log = NewTodo {
        event_date: "03/28/2024".to_string(),
        event_tasks: "Create todo application".to_string(),
    };
    let inserted_row = diesel::insert_into(todos::table)
        .values(&new_log)
        .get_result::<Todo>(connection);
    println!("{:?}", inserted_row);
}

#[get("/")]
pub fn index() -> RawHtml<String> {
    load_template("index")
}

#[derive(Debug, Deserialize)]
pub struct NewTodoRequest {
    pub date: String,
    pub todos: Vec<String>,
}

#[derive(Insertable)]
#[table_name = "todos"]
pub struct NewTodo {
    pub event_date: String,
    pub event_tasks: String,
}

#[post("/add_todo", data = "<todo_request>")]
pub fn add_todo(todo_request: Json<NewTodoRequest>) -> Json<String> {
    use crate::schema::todos::dsl::*;

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let connection = PgConnection::establish(&database_url).expect("Error connecting to database");

    for todo_item in &todo_request.todos {
        let new_todo = NewTodo {
            event_date: todo_request.date.clone(),
            event_tasks: todo_item.clone(),
        };

        let inserted_row = diesel::insert_into(todos)
            .values(&new_todo)
            .get_result::<Todo>(&connection)
            .expect("Error inserting todo into database");

        println!("New todo created with id: {}", inserted_row.id);
    }

    Json("Todos added successfully".to_string())
}

#[get("/search_todos/<date>")]
pub fn search_todos(date: String) -> Result<Json<Vec<Todo>>, Status> { // Change TodoResponse to Todo
    use crate::schema::todos::dsl::*;
    use diesel::prelude::*;

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let connection = PgConnection::establish(&database_url).expect("Error connecting to database");

    let todos_list = todos.filter(event_date.eq(&date))
        .load::<Todo>(&connection)
        .map_err(|_| Status::InternalServerError)?;

    Ok(Json(todos_list))
}



#[delete("/delete_todo", data = "<todo_ids>")]
pub fn delete_todo(todo_ids: Json<Vec<i32>>) -> Status {
    use crate::schema::todos::dsl::*;
    use diesel::prelude::*;

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let connection = PgConnection::establish(&database_url).expect("Error connecting to database");

    let ids: Vec<i32> = todo_ids.into_inner(); // Dereference to access inner Vec<i32>

    let deleted_rows = diesel::delete(todos.filter(id.eq_any(ids)))
        .execute(&connection);

    match deleted_rows {
        Ok(_) => Status::Ok,
        Err(_) => Status::InternalServerError
    }
}


#[post("/complete_todo/<id>")]
pub fn complete_todo(id: i32) -> Status {
    // You can implement marking todo as completed logic here
    Status::Ok
}

#[launch]
fn rocket() -> Rocket<Build> {
    dotenv().ok(); // Load environment variables from .env file
    rocket::build()
        .mount("/", routes![index, add_todo, search_todos, delete_todo, complete_todo])
        .mount("/css", FileServer::from("css"))
        .mount("/js", FileServer::from("js"))
}
