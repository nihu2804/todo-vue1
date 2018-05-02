const welcome = Vue.component('home', {
    data: function () {
        return {
            message: 'Welcome to Home'
        }
    },
    template: '#home'
});

const Profile = Vue.component('profile', {
    data: function () {
        return {
            count: 0
        }
    },
    template: '#my-profile'
});

const Todo = Vue.component('todo', {
    data: function () {
        return {
            newTask: "",
            tasks: [
                /*  {
                      text: "This is an example task. Delete or add your own",
                      checked: false,
                      id: 1
                  }*/
            ],
            count : 0,
            editingTask: {}
        }
    }, computed: {
        areAllSelected: function () {
            return this.tasks.every(function (task) {
                return task.checked;
            }) && this.tasks.length > 0;
        },
    },
    methods: {
        fetchData: function() {
            this.$http.get('https://vuejs-http-7f2d8.firebaseio.com/data.json')
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const resultArray = [];
                    for (let key in data) {
                        var obj = data[key];
                        obj.key = key;
                        resultArray.push(obj);
                    }
                    this.tasks = resultArray;
                    this.count = resultArray.length;
                });
        },

        addTask: function () {
            var task = this.newTask.trim();
            if (task) {
                this.count++;
                var newTask = {text: task, checked: false, id: this.count};
                this.newTask = "";
            }
            this.$http.post('https://vuejs-http-7f2d8.firebaseio.com/data.json', newTask)
                .then(function (response) {
                    console.log(response);
                    this.fetchData();
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        removeTask: function (task) {
            /* var index = this.tasks.indexOf(task);
             this.tasks.splice(index, 1);
 */
            var deleteKey;
            for(let t in this.tasks)
            {
                var item = this.tasks[t];
                if(item.id === task.id)
                    deleteKey = item.key;
            }

            this.$http.delete('https://vuejs-http-7f2d8.firebaseio.com/data/'+ deleteKey +'.json')
                .then(function (response) {
                    console.log(response);
                    this.fetchData();
                })
                .catch(function (error) {
                    console.log(error);
                });


        },

        editTask: function (task) {
            this.editingTask = task;
            console.log(task.text);
        },

        endEditing: function (task) {
            this.editingTask = {};
            if (task.text.trim() === "") {
                this.removeTask(task);
            }
            else {
                var newTask = {text: task.text, checked: false, id: task.id};

                var updateKey;
                for(let t in this.tasks)
                {
                    var item = this.tasks[t];
                    if(item.id === task.id)
                        updateKey = item.key;
                }

                this.$http.put('https://vuejs-http-7f2d8.firebaseio.com/data/'+updateKey+'.json', newTask)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }

        },

        clearList: function () {
            this.tasks = [];
        },

        selectAll: function (task) {
            var targetValue = this.areAllSelected ? false : true;
            for (var i = 0; i < this.tasks.length; i++) {
                this.tasks[i].checked = targetValue;
            }
        },

        check: function (task) {
            task.checked = true;
        },

        isChecked: function (task) {
            return task.checked;
        }
    },
    beforeMount(){
        this.fetchData()

    },
    template: '#my-todo'
});


const todoDetail = Vue.component('todoDetail', {
    data: function () {
        return {
            key: this.$route.params.id,
            task:{}
        }
    },
    watch:{
        '$route'(to, from)
        {
            this.taskId = to.params.id;
        }
    },
    methods: {
        fetchTaskDetail: function () {

            this.$http.get('https://vuejs-http-7f2d8.firebaseio.com/data/'+ this.key +'.json')
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const resultArray = [];
                    console.log(data);

                    for (let key in data) {
                        console.log(data[key]);

                        var obj = data[key];
                        obj.key = key;
                        resultArray.push(obj);
                    }
                    console.log(resultArray);
                    this.task = data;
                    console.log(this.task);

                });
        }
    },
    beforeMount(){
        this.fetchTaskDetail()

    },
    template:'#todoDetail'
});


const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/', component: welcome},
        {
            path: '/profile', component: Profile, name: 'profile'
        },
        {path: '/todo', component: Todo, name:'todo'},
        {path: '/todo/:id', component: todoDetail, name:'todo-detail'}

    ]
});

Vue.use(VueResource);
Vue.http.options.root= 'https://vuejs-http-7f2d8.firebaseio.com/';
new Vue({
    router,
    el: '#app',
    data: function () {
        return {}
    }
}).$mount('#app');