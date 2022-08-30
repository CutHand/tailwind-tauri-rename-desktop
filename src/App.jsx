import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  appWindow,
  LogicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";
import { open } from "@tauri-apps/api/dialog";
function AddItem() {
  return (
    <span class="group inline-flex items-center justify-center p-1 mr-1 bg-indigo-100 rounded-md hover:shadow-sm hover:bg-indigo-400 cursor-pointer">
      <svg
        class="w-6 h-6  stroke-indigo-700 group-hover:stroke-indigo-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        fill="none"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3v18m9-9H3"
        />
      </svg>
    </span>
  );
}
function ReduceItem() {
  return (
    <span class="group inline-flex items-center justify-center p-1 mr-1 bg-indigo-100 rounded-md hover:shadow-sm hover:bg-indigo-400 cursor-pointer">
      <svg
        class="w-6 h-6  stroke-indigo-700 group-hover:stroke-indigo-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        fill="none"
      >
        <path stroke-linecap="round" d="M3 12h18" />
      </svg>
    </span>
  );
}

function App() {
  const [canMove, setCanMove] = useState(false);
  const [mousePagePosition, setMousePagePosition] = useState({ x: 0, y: 0 });
  const [moveScope, setMoveScope] = useState({ x: 0, y: 0 });
  const [currentMove, setCurrentMove] = useState({ x: 0, y: 0 });
  const fileInput = useRef(null);
  const [dirList, setDirList] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [fixZeroExp, setFixZeroExp] = useState();
  const [fixZeroNum, setFixZeroNum] = useState(0);
  useEffect(() => {
    async function readFile() {
      let paths = await invoke("read_file", { dirList });
      setFileList(pre => [
        ...pre,
        ...paths.map(p => ({ dir: p, fileName: p.split("\\").slice(-1)[0] })),
      ]);
      console.log(fileList);
    }
    readFile();
    console.log("dirList", dirList);
  }, [dirList]);
  useEffect(() => {
    console.log("Exgexp change...");
    if (fixZeroExp != "" && fixZeroNum != 0) {
      console.log("if continue ...");
      setFileList(pre => [
        ...pre.map(item => {
          console.log("map loop ....");
          let oldName = item.fileName;
          let oldNum = oldName.match(fixZeroExp);
          console.log(oldName, oldNum, fixZeroExp);
          if (oldNum != null) {
            console.log("匹配成功");
            let newNum = oldNum[0];
            let nameListLossy = oldName.split(fixZeroExp);
            while (newNum.length <= fixZeroNum) {
              newNum = "0" + newNum;
            }
            if (newNum.length > fixZeroNum) {
              newNum = newNum.slice(fixZeroNum * -1);
            }
            nameListLossy.splice(1, 0, newNum);
            return { dir: item.dir, fileName: nameListLossy.join("") };
          } else {
            return item;
          }
        }),
      ]);
      console.log(fileList);
    }
  }, [fixZeroExp, fixZeroNum]);

  async function test() {
    let nameList = fileList.map(item => [
      item.dir,
      [...item.dir.split("\\").slice(0, -1),item.fileName].join('\\')
    ]);
    // console.log(nameList)
    let changeNum = await invoke("rename_handle", { nameList });
    console.log(changeNum,"个文件更改了。");
  }

  return (
    <div
      class="grid gap-1 grid-rows-[50px_minmax(0,_1fr)] grid-cols-[400px_minmax(0,_1fr)] h-screen bg-gray-50"
      style={{ select: "none" }}
    >
      {/* top */}
      <div
        class="p-3 rounded-b-md col-span-2 bg-indigo-50 flex justify-between items-center"
        onMouseDown={async e => {
          e.preventDefault;
          setCanMove(true), setMousePagePosition({ x: e.pageX, y: e.pageY });
          const size = await appWindow.outerSize();
          const monitor = await currentMonitor();
          setMoveScope({
            x: monitor.size.width - size.width,
            y: monitor.size.height - size.height,
          });
        }}
        onMouseUp={e => {
          e.preventDefault;
          setCanMove(false);
        }}
        onMouseMove={async e => {
          e.preventDefault;
          let x_move = e.screenX - mousePagePosition.x;
          let y_move = e.screenY - mousePagePosition.y;
          // console.log(x_move, y_move);
          // console.log(currentMove);
          if (
            canMove
            // x_move > 0 &&
            // y_move > 0 &&
            // x_move < moveScope.x &&
            // y_move < moveScope.y &&
            // (x_move != currentMove.x ||
            // y_move != currentMove.y)
          ) {
            await appWindow.setPosition(new LogicalPosition(x_move, y_move));
            setCurrentMove({ x: x_move, y: y_move });
            console.log("moved");
          }
        }}
      >
        <div class=" font-sans text-2xl font-semibold text-indigo-600">
          Rename
        </div>
        <div class="flex items-center">
          <span
            class="inline-flex items-center justify-center p-1 mr-1 bg-indigo-500 rounded-md hover:shadow-lg transition-all ease-in-out hover:hue-rotate-60 hover:rotate-6 active:scale-95 cursor-pointer"
            onClick={() => appWindow.minimize()}
          >
            <svg
              class="w-6 h-6  stroke-gray-50 "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              fill="none"
            >
              <path stroke-linecap="round" d="M3 12h18" />
            </svg>
          </span>
          <span
            class="inline-flex items-center justify-center p-1 mr-1 bg-indigo-500 rounded-md hover:shadow-lg transition-all ease-in-out hover:hue-rotate-60 hover:-rotate-6 active:scale-95 cursor-pointer"
            onClick={() => appWindow.toggleMaximize()}
          >
            <svg
              class="w-6 h-6 stroke-gray-50 "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              fill="none"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
              />
            </svg>
          </span>
          <span
            class="inline-flex items-center justify-center p-1 bg-indigo-500 rounded-md hover:shadow-lg transition-all ease-in-out hover:hue-rotate-60 hover:rotate-6 active:scale-95 cursor-pointer"
            onClick={() => appWindow.close()}
          >
            <svg
              class="w-6 h-6  stroke-gray-50 "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 19.5l15-15m-15 0l15 15"
              />
            </svg>
          </span>
        </div>
      </div>
      {/* left */}
      <div class="pl-2 rounded-t-md bg-gray-10 overflow-auto text-gray-700 bg-white">
        <div class="mt-2">
          <header class="text-xl font-bold ml-1 ">查找 :</header>
          <div class="pl-2 text-gray-500">
            {/* <section>
              <div class="flex p-1 mt-1">
                <input
                  multiple
                  type="file"
                  class="flex-auto mr-2  text-slate-500 border-[1px] cursor-pointer
                    shadow-sm w-0  file:cursor-pointer
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  onChange={e => {
                    console.log(fileInput.current.files);
                    console.log(e)
                  }}
                  ref={fileInput}
                />
                <div class="flex items-center">
                  <ReduceItem />
                </div>
                <div class="flex items-center">
                  <AddItem />
                </div>
              </div>
            </section> */}
            <section>
              <div class="flex p-1 mt-1">
                <input
                  class="mr-2 w-0 flex-auto px-2"
                  placeholder="双击选择一个文件夹📂"
                  readOnly
                  onDoubleClick={async e => {
                    const selected = await open({
                      directory: true,
                      mutiple: true,
                    });
                    if (selected == null) {
                      // console.log("nothing !", selected, e);
                    } else {
                      // console.log(selected);
                      e.target.value = selected;
                      if (!dirList.includes(selected)) {
                        setDirList(pre => [...pre, selected]);
                      }
                    }
                  }}
                />
                <div class="flex items-center">
                  <ReduceItem />
                </div>
                <div class="flex items-center">
                  <AddItem />
                </div>
              </div>
            </section>
          </div>
        </div>
        <div class="mt-2">
          <header class="text-xl font-bold ml-1 ">筛选 :</header>
          <div class="pl-2 text-gray-500">
            <section>
              <div class="flex p-1 mt-1">
                <select
                  class="form-select
                  text-center
                  px-2
                  py-1
                  appearance-none
                  block
                  rounded-md
                  border-[1px]
                  shadow-sm
                  focus:outline-none
                  focus:ring-1
                  focus:ring-blue-400 
                  focus:border-blue-400
                  hover:ring-1
                  hover:ring-blue-400 
                  hover:border-blue-400
            "
                  aria-label="Default select example"
                >
                  <option class="rounded-md" selected>
                    包含
                  </option>
                  <option value="1">不包含</option>
                  <option value="2">正则</option>
                </select>
                <input class="mx-2 w-0 flex-auto px-2" />
                <div class="flex items-center">
                  <ReduceItem />
                </div>
                <div class="flex items-center">
                  <AddItem />
                </div>
              </div>
            </section>
            <section>
              <div class="flex p-1 mt-1">
                <select
                  class="form-select
                  text-center
                  px-2
                  py-1
                  appearance-none
                  block
                  rounded-md
                  border-[1px]
                  shadow-sm
                  focus:outline-none 
                  hover:ring-1
                  hover:ring-blue-400 
                  hover:border-blue-400
            "
                  aria-label="Default select example"
                >
                  <option class="rounded-md" selected>
                    包含
                  </option>
                  <option value="1">不包含</option>
                  <option value="2">正则</option>
                </select>
                <input class="mx-2 w-0 flex-auto px-2" />
                <div class="flex items-center">
                  <ReduceItem />
                </div>
                <div class="flex items-center">
                  <AddItem />
                </div>
              </div>
            </section>
          </div>
        </div>
        <div class="mt-2">
          <header class="text-xl font-bold ml-1 ">替换 :</header>
          <div class="pl-2 text-gray-500">
            <section>
              <div class="flex p-1 mt-1">
                <select
                  class="form-select
                  text-center
                  px-2
                  py-1
                  appearance-none
                  block
                  rounded-md
                  border-[1px]
                  shadow-sm
                  focus:outline-none 
                  hover:ring-1
                  hover:ring-blue-400 
                  hover:border-blue-400"
                  aria-label="Default select example"
                >
                  <option class="rounded-md" selected>
                    普通
                  </option>
                  <option value="2">正则</option>
                </select>
                <input class="mx-2 w-0 flex-auto px-2" />
                <div class="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6 stroke-indigo-700"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
                <input class="mx-2 w-0 flex-auto px-2" />
                <div class="flex items-center">
                  <ReduceItem />
                </div>
                <div class="flex items-center">
                  <AddItem />
                </div>
              </div>
            </section>
            <section class="bg-gray-100 rounded-md">
              <div class="flex p-1 mt-1">
                <div class="flex items-center text-center px-2 py-1">
                  数字补零正则 :
                </div>
                <input
                  class="mx-2 w-0 flex-auto px-2"
                  // value={fixZeroExp}
                  onChange={e => {
                    try {
                      let exp = new RegExp(e.target.value);
                      setFixZeroExp(exp);
                    } catch (error) {
                      console.log("请输入一个正确的表达式！");
                    }
                  }}
                />
                <div
                  class="flex items-center text-center px-2 py-1"
                  type="number"
                >
                  位数 :
                </div>
                <input
                  class="mx-2 w-0 flex-auto px-2 max-w-[40px] text-center"
                  // value={fixZeroNum}
                  onChange={e => setFixZeroNum(e.target.value)}
                />
                {/* <div class="flex items-center">
                  <ReduceItem />
                </div>
                <div class="flex items-center">
                  <AddItem />
                </div> */}
              </div>
            </section>

            <section class="rounded-md">
              <div class="flex p-1 mt-1">
                (?&lt;=[\u4e00-\u9fa5])\d+(?=[\u4e00-\u9fa5])
              </div>
            </section>
          </div>
        </div>
        <div class="mt-5">
          <div class="pl-3">
            <div class="flex items-center justify-evenly">
              <span>
                <input
                  type="checkbox"
                  id="include_sub_file"
                  class="peer h-0 w-0 hidden"
                />
                <label
                  htmlFor="include_sub_file"
                  class="cursor-pointer -indent-96 w-[50px] h-[30px] bg-gray-200 block rounded-[15px]
                                          relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[26px] after:h-[26px] after:bg-white after:rounded-full after:transition-all after:duration-150
                                          peer-checked:after:left-[48px] peer-checked:after:-translate-x-full peer-checked:bg-indigo-500
                                          active:after:w-[30px]"
                ></label>
              </span>
              <span>包含子文件夹</span>
              <span>
                <input
                  type="checkbox"
                  id="ignore_case"
                  class="peer h-0 w-0 hidden"
                />
                <label
                  htmlFor="ignore_case"
                  class="cursor-pointer -indent-96 w-[50px] h-[30px] bg-gray-200 block rounded-[15px]
                                          relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[26px] after:h-[26px] after:bg-white after:rounded-full after:transition-all after:duration-150
                                          peer-checked:after:left-[48px] peer-checked:after:-translate-x-full peer-checked:bg-indigo-500
                                          active:after:w-[30px]"
                ></label>
              </span>
              <span>忽略大小写</span>
            </div>
            <div class="mt-2 mr-2 flex justify-end items-center">
              <span
                onClick={() => test()}
                class="px-2 py-1 flex items-center bg-indigo-500 text-indigo-100  text-lg rounded-md transition-all ease-in-out hover:hue-rotate-90 active:scale-95"
              >
                <p class="mr-2">生成</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 013.7-3.7 48.678 48.678 0 017.324 0 4.006 4.006 0 013.7 3.7c.017.22.032.441.046.662M4.5 12l-3-3m3 3l3-3m12 3c0 1.232-.046 2.453-.138 3.662a4.006 4.006 0 01-3.7 3.7 48.657 48.657 0 01-7.324 0 4.006 4.006 0 01-3.7-3.7c-.017-.22-.032-.441-.046-.662M19.5 12l-3 3m3-3l3 3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* right */}
      <div class="rounded-t-md overflow-auto text-gray-500">
        {fileList.map((item, index) => (
          <div
            key={index}
            class="flex items-center mt-2 mx-2 px-3 py-2 bg-white border-[1px]
          shadow-sm hover-indigo-customize rounded-md"
          >
            <div class="w-7/12 flex items-center">
              <span class="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
              </span>
              <span class="text-ellipsis overflow-hidden">{item.dir}</span>
            </div>
            <div class=" w-1/12 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 stroke-indigo-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </div>
            <div class="w-4/12 text-ellipsis overflow-hidden">
              {item.fileName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
