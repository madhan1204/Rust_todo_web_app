// @generated automatically by Diesel CLI.

diesel::table! {
    todos (id) {
        id -> Int4,
        event_date -> Varchar,
        event_tasks -> Varchar,
    }
}
