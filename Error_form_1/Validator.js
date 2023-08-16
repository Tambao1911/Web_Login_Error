
function Validator(formSelector){
    var _this = this;
    const formRules = {};

    // Tìm Kiếm các thẻ cha của element
    function getParent(element , selector){
        while(element.parentElement){
            // Kiểm tra xem có các chuỗi con phug hợp không
            if(element.parentElement.matches(selector)){
                // Nếu có thì trả ra chính cái thẻ đó
                return element.parentElement;
            }
            // Nếu Không đúng thì gán chính cái pran để 
            // sau vòng lặp nó sẽ đứng ở vị trí đó để nhảy bước tiếp theo
            element = element.parentElement
            
        }
    }



    /*  
        Quy Ước Tạo Rules
        -Nếu có lỗi thì return error message
        -Nếu Không có lỗi thì return undefined
    */
    const validatorRules = {
        required:function(value){
            return value ? undefined : 'Vui Lòng Nhập Trường Này'

        },
        email:function(value){
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui Lòng Nhập Email'
        },
        min:function(min){
            return function(value){
                return value.length >= min ? undefined :`Vui Lòng Nhập Ít Nhât ${min}  Kí Tự`
            }
        },
    };

    // Lấy ra form element theo formSelector
    const formElement = document.querySelector(formSelector);
    // Chỉ sử lí khi có element trong DOM
    if(formElement){
        const inputs = formElement.querySelectorAll('[name][rules]')
        // lặp qua để lấy các element trong nodeList của inputs
        for(var input of inputs){
            var rules = input.getAttribute('rules').split('|')
            for(var rule of rules){
                var ruleInfo;
                // rules có : thì là rule cần value
                var isRuleHasValue = rule.includes(':')
                // Kiểm tra xem có min:6 không
                if(isRuleHasValue){
                    ruleInfo = rule.split(':')
                    // gán vào rule kí tự 0 là min | 1 là 6
                    rule = ruleInfo[0];

                }
                var ruleFunc=validatorRules[rule];

                if(isRuleHasValue){
                    // gán lại func bằng chính nó chạy vào gán nó bằng giá trị 6 thứ 2
                    ruleFunc = ruleFunc((ruleInfo[1]))
                }
                if(Array.isArray(formRules[input.name])){
                    // thêm function thành value của các key trong formRules
                    formRules[input.name].push(ruleFunc);
                }
                else{
                    // Gán function vào mảng (lần này gán cho nó là Array xong mới chạy if )
                    formRules[input.name] = [ruleFunc]
                }
            }
            // Lắng nghe sự kiện để validate (blur , change , ....)
            input.onblur = handleValidate ;
            input.oninput = handleClearError ;
        }
        // Hàm thực hiên Vailidate
        function handleValidate(event){
            // Lấy ra rule theo key
            const rules = formRules[event.target.name];
            var errorMess;

            // Lấy ra func requied , email,min //Và trả ra lỗi 
            for(var rule of rules){
                errorMess = rule(event.target.value)
                if(errorMess) break;
            }
           
            // Nếu có lỗi thì hiển thị mess lỗi ra html
            if(errorMess){
                const formGroup = getParent(event.target,'.form-group')
                // Từ FormGroup Lấy ra class form message và in ra html khi được gán erroMess(lỗi)
                if(formGroup){
                    formGroup.classList.add('invalid')
                    const formMess = formGroup.querySelector('.form-message')
                    if(formMess){
                        formMess.innerText = errorMess;
                    }
                }
            }
            // Khi validate thành công thì nó trả về là true
            return !errorMess;
        }
        // Hàm clear messError
        function handleClearError(event){
            const formGroup = getParent(event.target,'.form-group')
            // Kiểm Tra xem có class invalid hay không
            if(formGroup.classList.contains('invalid')){
                // có thì xóa nó đi
                formGroup.classList.remove('invalid')   
                const formMess = formGroup.querySelector('.form-message')
                // Và gán cái innerText bằng chuỗi rỗng
                if(formMess){
                    formMess.innerText = '';
                }
            }
        }
    }

    // Xử Lí hành vi submit form
    formElement.onsubmit = function (event){
        event.preventDefault();

        const inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true;
        // lặp qua để lấy các element trong nodeList của inputs
        for(var input of inputs){
            // Tự chuyền vào event và kiểm tra nếu không hợp lệ thì gán bằng false
            if(!handleValidate({target: input})){
                isValid = false;
            }
        }
        
        // Khi Không Có lỗi thì submit form 
        if(isValid){
            if(typeof _this.onSubmit === 'function'){
                const enableInput = formElement.querySelectorAll('[name]')
                    const formValues = Array.from(enableInput).reduce((values , input)=>{
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] =''
                                    return values
                                } 
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] =[]
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    },{})

                    // GỌi Lại hàm onSubmit và trả về giá trị form theo oject
                _this.onSubmit(formValues);
            }
            else{
                formElement.submit();
            }
        }
    }
}