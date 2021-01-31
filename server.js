 @ResponseBody
    @PostMapping(value = "/imageUpload")
    public String saveImage(@RequestParam(value = "file") MultipartFile file, HttpServletRequest request){
        String filepath="/root/image/";
        if (file.isEmpty()) {
            System.out.println("文件为空空");
            return "文件为空空";
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            // 遍历数组
            for (Cookie cookie : cookies) {
                //如果有token
                if (cookie.getName().equals("token")) {
                    // 取出cookie的值
                    String value = cookie.getValue();
                    //如果accesstoken不为空的话
                    //生成文件路径
                    String fileName = file.getOriginalFilename();  // 文件名
                    //后缀名
                    String suffixName = fileName.substring(fileName.lastIndexOf("."));
                    if (!".jpg".equals(suffixName) && !".jpeg".equals(suffixName) && !".png".equals(suffixName) && !".bmp".equals(suffixName)
                            && !".gif".equals(suffixName)) {
                        return "上传失败:无效图片文件类型";
                    }
                    long fileSize = file.getSize();
                    if(fileSize>1024*500){
                        return "图片过大";
                    }
                    filepath=filepath+value+suffixName;
                    File dest = new File(filepath);
                    if (!dest.getParentFile().exists()) {
                        dest.getParentFile().mkdirs();
                    }
                    try {
                        file.transferTo(dest);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    //修改数据库
                    String iconUrl="/imageGet/"+value+suffixName;
                    usrService.updateIcon(iconUrl,value);
                    break;
                }
            }
        }
        return "success";
    }
@RequestMapping(value = "/imageGet/{name}",produces = MediaType.IMAGE_JPEG_VALUE)
    @ResponseBody
    public byte[] getImage(/*@PathVariable("place")String place,*/
                           @PathVariable("name")String name){
        String filepath="/root/image/";
        File file = new File(filepath+name);
        FileInputStream inputStream = null;
        byte[] bytes =null;
        try {
            inputStream = new FileInputStream(file);
            bytes = new byte[inputStream.available()];
            inputStream.read(bytes, 0, inputStream.available());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return bytes;
    }