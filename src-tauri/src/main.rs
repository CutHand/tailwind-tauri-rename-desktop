#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[tauri::command]
fn read_file(dir_list: Vec<&str>) -> Vec<String> {
    let mut v: Vec<String> = Vec::new();
    // let mut entries = fs::read_dir(".")?
    // .map(|res| res.map(|e| e.path()))
    // .collect::<Result<Vec<_>, io::Error>>()?;
    for dir in dir_list {
        println!("{}", dir);
        let entry = std::fs::read_dir(dir).unwrap();
        let entry_path: Vec<_> = entry.map(|e| e.unwrap().path()).collect();
        // dbg!(entry_path);
        for f in entry_path {
            let path = f.into_os_string().into_string().unwrap();
            v.push(path);
        }
    }
    v
}
#[tauri::command]
fn rename_handle(name_list: Vec<Vec<&str>>) -> i32 {
    let mut change_count = 0;
    for name_tulp in name_list {
        let old_path = name_tulp.get(0).unwrap();
        let new_path = name_tulp.get(1).unwrap();
        if old_path != new_path {
            std::fs::rename(old_path, new_path).unwrap();
            change_count = change_count + 1;
        }
    }
    change_count
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_file, rename_handle])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
