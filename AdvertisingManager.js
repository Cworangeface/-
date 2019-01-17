(function () {

    var js_url = '../../';

    var loginStatus = sessionStorage.getItem('loginStatus');
    if (!loginStatus) {
        location.href = js_url + 'Login/Index';
    } else {

        var project_edit = true;
        var project_del = true;
        var project_change = true;
        var type = sessionStorage.getItem('userType');

        // 声明要使用的layui组件
        var table = layui.table;
        var form = layui.form;
        var laypage = layui.laypage;
        var layer = layui.layer;

        //获取表格容器高度
        var tableHeight = $('.table-con').height();


        //获取用户信息
        var usertype = sessionStorage.getItem('userType');
        var userData = JSON.parse(sessionStorage.getItem('userData'));
        var level = function () {
            if (type == '超级管理员') {
                return 1;
            } else if (type == '城市管理员') {
                return 2;
            } else if (type == '集团管理员') {
                return 3;
            } else if (type == '项目管理员') {
                return 4;
            } else if (type == '内置超级管理员') {
                return 5;
            }
        }
        var hasProject = $(window.parent.document).find('.body-con').attr('data-project');
        if (!hasProject) {
            layer.msg("项目为空，请先新建项目")
            return false;
        } else {
            $('.btn-con').attr('data-project', hasProject);
        }
        if (!project_edit) {
            $('.body-con .btn-con .create-btn').addClass('layui-btn-disabled');
        }

        var userID = function () {
            if (userData.superAdmin) {
                return userData.superAdmin.ID;
            } else if (userData.cityAdmin) {
                return userData.cityAdmin.ID;
            } else if (userData.groupAdmin) {
                return userData.groupAdmin.ID;
            } else if (userData.parkingAdmin) {
                return userData.parkingAdmin.ID;
            }
        }

        //表格初始参数
        var curr_index = 0;
        var total_count = 0;
        var page_num = 25;

        //表单验证，对应input的lay-verify属性
        form.verify({
            //pass为自定义名称,第一个值为正则表达式，第二个值为弹出的内容，可定义多个验证条件
            pass: [
                /^[a-zA-Z0-9]{6,12}$/
                , '密码必须是6到12位的字母或数字'
            ],
            account: [
                /^[a-zA-Z0-9]+$/
                , '账号必须是字母或数字'
            ],
            tel: [
                /^[0-9]{11}$/
                , '请输入11位手机号码'
            ],
            cn: [
                /^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$/
                , '请输入正确的姓名，不能使用特殊字符'
            ]
        });

        //渲染表格
        table.render({
            elem: '#table-projectAdmin'
            , height: tableHeight
            , url: js_url + 'AdvertisingManager/GetAdvertisingForProject'
            , where: {
                projectId: hasProject
            }
            , even: true
            , method: 'post'
            , cols: [[
                {
                    field: 'ImageHttpUrl', title: '图片', align: 'center', templet: function (d) {
                        var url = d.ImageHttpUrl;
                        var html = '<img src="' + url + '" class="get-img"></img>'
                        return html;
                    }
                }
                , {
                    field: 'UpdateTime', title: '上传时间', align: 'center', templet: function (d) {
                        var info = d.UpdateTime;
                        if (!!info) {
                            var time = info.replace('/Date(', '').replace(')/', '');
                            var newTime = new Date(parseInt(time));
                            var year = newTime.getFullYear();
                            var month = newTime.getMonth() + 1;
                            var date = newTime.getDate();
                            var hour = newTime.getHours();
                            var minutes = newTime.getMinutes();
                            var seconds = newTime.getSeconds();
                            if (month < 10) {
                                month = '0' + month;
                            }
                            if (date < 10) {
                                date = '0' + date;
                            }
                            if (hour < 10) {
                                hour = '0' + hour;
                            }
                            if (minutes < 10) {
                                minutes = '0' + minutes;
                            }
                            if (seconds < 10) {
                                seconds = '0' + seconds;
                            }
                            return year + '-' + month + '-' + date + ' ' + hour + ':' + minutes + ':' + seconds;
                        } else {
                            return '无'
                        }
                    }
                }
                , { field: 'toolBar', title: '操作', width: '170', toolbar: '#projectAdmin-toolbar', align: 'center' }
            ]],
            done: function (res, curr, count) {
                hoverOpenImg();//显示大图

                if (!project_edit) {
                    $('a[lay-event="edit"]').addClass('layui-btn-disabled');
                }
                if (!project_del) {
                    $('a[lay-event="del"]').addClass('layui-btn-disabled');
                }
                if (!project_change) {
                    $('a[lay-event="change"]').addClass('layui-btn-disabled');
                }
                total_count = count;
                laypage.render({
                    elem: 'page-projectAdmin' //注意，这里的ID不用加 # 号
                    , count: count
                    , curr: curr_index + 1
                    , limit: page_num
                    , limits: [25, 50, 75]
                    , groups: 3
                    , layout: ['prev', 'page', 'next', 'count', 'skip', 'limit']
                    , jump: function (obj, first) {
                        if (!first) {
                            curr_index = obj.curr - 1;
                            page_num = obj.limit;
                            table.reload('table-projectAdmin', {
                                where: {
                                    projectId: hasProject
                                }
                            });
                        }
                    }
                });
            }
        });

        function hoverOpenImg() {
            var img_show = null; // tips提示
            $('td img').hover(function () {
                //alert($(this).attr('src'));
                var img = "<img class='img_msg' src='" + $(this).attr('src') + "' style='max-width:400px;max-height:260px;'/>";
                img_show = layer.open({
                    type: 1,
                    closeBtn: 0,
                    shade: false,
                    title: false,
                    shadeClose: false,
                    area: ['auto', 'auto'],
                    offset: ['200px', '410px'],
                    scrollbar: false,
                    content: img
                })
                //img_show = layer.tips(img, this, {
                //    tips: [1, 'rgba(1,1,1,0)'],
                //   // offset: 'auto'
                //    //area: ['400px']
                    
                //});
            }, function () {
                layer.close(img_show);
            });
            $('td img').attr('style', 'max-width:80px');
        }
        

        // 刷新表格
        $('.body-con .btn-con .reset-btn').on('click', function () {
            var project_id = $('.btn-con').attr('data-project');
            if (project_id != '' && project_id != null && project_id != undefined) {
                table.reload('table-projectAdmin', {
                    where: {
                        projectId: project_id
                    }
                });
            } else {
                layer.msg('项目为空，请先新建项目');
            }
        });


        //监听工具条
        table.on('tool(table-projectAdmin)', function (obj) { //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
            var data = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            var login_id = userID();
            var ID = data.ID;
            var project_id = data.ProjectID;


            if (layEvent === 'edit') { //编辑
                if (project_edit) {
                    layer.open({
                        type: 1,
                        area: '500px',
                        content: $('#projectAdmin-create-con'),
                        title: ['编辑广告', 'font-size:16px;'],
                        resize: false,
                        scrollbar: false,
                        id: 3,
                        success: function () {
                            $('#projectAdmin-create-con button[lay-submit]').attr('lay-filter', 'projectAdmin-edit-submit');
                            $('#projectAdmin-create-con button[lay-submit]').attr('disabled', true);
                            $('#projectAdmin-create-con button[lay-submit]').addClass('layui-btn-disabled');
                            $('input[name="UpImage"]').val('');
                            $('input[name="projectID"]').val('');
                            $('input[name="ID"]').val('');
                            $('#showImg').attr('src', '');
                        },
                        end: function () {
                            $('#projectAdmin-create-con button[lay-submit]').attr('lay-filter', 'cityAdmin-add-submit');
                            $('#projectAdmin-create-con button[lay-submit]').attr('disabled',false);
                            $('#projectAdmin-create-con button[lay-submit]').removeClass('layui-btn-disabled');
                            $('#projectAdmin-create-con').hide();
                        }
                    })
                }

                // 确认编辑
                form.on('submit(projectAdmin-edit-submit)', function (data) {
                    $('input[name="projectID"]').val(project_id);
                    $('input[name="ID"]').val(ID);
                    var mask;
                    $('.formSubmit').ajaxSubmit({
                        beforeSubmit: function (arr, $form, options) {
                            mask = layer.load(1, { shade: [0.8, '#393D49'] });
                        },
                        success: function (data) {
                            if (data.Status == true) {
                                //$(".click").removeClass("click");
                                //$("#SerialNumber").attr("disabled", false);
                                layer.closeAll();
                                layer.msg("上传成功", { icon: 1, time: 1000 })
                                table.reload('table-projectAdmin', {
                                    where: {
                                        projectId: project_id
                                    }
                                });

                                //globalTable.reload();
                            } else {
                                layer.msg("上传失败", { icon: 2, time: 1000 })
                            }
                        },
                        error: function (data) { }
                    });

                    return false; //阻止表单跳转。
                });

            } else if (layEvent === 'del') { //删除
                if (project_del) {
                    var mask;
                    layer.confirm('确认删除此条数据吗？', { icon: 3, title: '删除广告' }, function (index) {
                        $.ajax({
                            url: js_url + 'AdvertisingManager/DeleteAD',
                            type: 'post',
                            data: { Id: ID },
                            beforeSend: function () {
                                mask = layer.load(1, { shade: [0.8, '#393D49'] });
                            },
                            success: function (data) {
                                layer.close(mask);
                                if (!!data) {
                                    var status = data.Status;
                                    if (status) {
                                        //obj.del(); //删除对应行（tr）的DOM结构，并更新缓存
                                        layer.msg('删除成功', {
                                            icon: 6,
                                            anim: 0,
                                            time: 2000,
                                            shade: [0.5, '#393D49']
                                        }, function () {
                                            layer.closeAll();
                                        });
                                        var project_id = $('.btn-con').attr('data-project');

                                        table.reload('table-projectAdmin', {
                                            where: {
                                                projectId: project_id
                                            }
                                        });
                                    } else {
                                        layer.msg(data.Msg)
                                    }

                                } else {
                                    alert('返回的data数据不正确')
                                }
                            },
                            error: function () {
                                layer.close(mask);
                                alert('数据传输失败')
                            }
                        });
                    });

                }
            }
        });

        // 表格高度自适应
        $(window).resize(function () {
            var reHeight = $('.table-con').height();
            table.reload('table-projectAdmin', {
                height: reHeight
            });
        });

        // 新增
        $('.body-con .btn-con .create-btn').on('click', function () {
            if (project_edit) {
                var project_id = $('.btn-con').attr('data-project');
                if (project_id != '' && project_id != null && project_id != undefined) {
                    layer.open({
                        type: 1,
                        area: '500px',
                        content: $('#projectAdmin-create-con'),
                        title: ['新增广告', 'font-size:16px;'],
                        resize: false,
                        offset: ['20px'],
                        scrollbar: false,
                        id: 1,
                        success: function () {
                            $('#projectAdmin-create-con button[lay-submit]').attr('disabled', true);
                            $('#projectAdmin-create-con button[lay-submit]').addClass('layui-btn-disabled');
                            $('input[name="UpImage"]').val('');
                            $('input[name="projectID"]').val('');
                            $('input[name="ID"]').val('');
                            $('#showImg').attr('src', '');
                            $('#showImg').hide();
                            form.render();
                        },
                        end: function () {
                            $('#projectAdmin-create-con').hide();
                        }
                    })
                } else {
                    layer.msg('项目为空，请先新建项目');
                }
            }
        });

        function getObjectURL(file) {
            var url = null;
            if (window.createObjectURL != undefined) {
                url = window.createObjectURL(file)
            } else if (window.URL != undefined) {
                url = window.URL.createObjectURL(file)
            } else if (window.webkitURL != undefined) {
                url = window.webkitURL.createObjectURL(file)
            }
            return url
        };
        //选择图片时,展示图片
        document.querySelector("#upload").onchange = function () {
            var size = this.files[0].size;
            var maxSize = 500000;
            if (size > maxSize) {
                layer.msg('上传的图片不能大于500K')
                $('#projectAdmin-create-con button[lay-submit]').addClass('layui-btn-disabled');
                $('#projectAdmin-create-con button[lay-submit]').attr('disabled', true);
            } else {
                $('#showImg').show();
                var nowUrl = getObjectURL(this.files[0]);
                document.querySelector("#showImg").setAttribute("src", nowUrl);
                $('#projectAdmin-create-con button[lay-submit]').removeClass('layui-btn-disabled');
                $('#projectAdmin-create-con button[lay-submit]').removeAttr('disabled');
            }
        }

        //提交事件
        form.on('submit(cityAdmin-add-submit)', function (data) {
            var project_id = $('.btn-con').attr('data-project');
            $('input[name="ProjectID"]').val(project_id);
            $('input[name="ID"]').val('');
            $('.formSubmit').ajaxSubmit({
                beforeSubmit: function (arr, $form, options) {
                },
                success: function (data) {
                    if (data.Status == true) {
                        layer.closeAll();
                        layer.msg("上传成功", { icon: 1, time: 1000 })
                        table.reload('table-projectAdmin', {
                            where: {
                                projectId: project_id
                            }
                        });

                        //globalTable.reload();
                    } else {
                        layer.msg("上传失败", { icon: 2, time: 1000 })
                    }
                },
                error: function (data) {}
            });
            return false;
        });

        //父页面调用刷新
        function reset_list() {
            var project_id = $('.body-con .btn-con').attr('data-project');
            curr_index = 0;
            var info = {
                PageIndex: curr_index,
                PageSize: page_num,
                SortField: '',
                SortOrder: true,
                ProjectID: project_id,
            };
            table.reload('table-cityAdmin', {
                where: {
                    param: info
                }
            });
        }

        //回车提交
        $('#projectAdmin-create-con,#change-pass-con').on('keyup', function (e) {
            if (e.keyCode == "13") {
                $(this).find('button[lay-submit]').click();
            }
        })

        //使验证红色边框不常驻
        $('input').focus(function () {
            $('input').removeClass('layui-form-danger');
        });
    }

})()
