document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

const bookSearch = function(books, q){
  return books.filter(function(book){
      return book.name.toLowerCase().indexOf(q.toLowerCase()) > -1;
  }).map(function(book) {
    return book.name;
  });
};

const firstChapterLink = function(book){
    return `../${book}+1`;
};

const state = {
  books: [],
  chapters: [],
  autocompleteList : [],
  autocompleteInput: '',
  autocompleteIndex: 0,
  inputFocus: false
};

const mutations = {
  INITIALIZE_BOOKS(state, payload){
    state.books = payload;
  },
  INITIALIZE_CHAPTERS(state, payload){
    state.chapters = payload;
  },
  UPDATE_AUTOCOMPLETE_LIST(state, newList){
    state.autocompleteList = newList
  },
  RESET_AUTOCOMPLETE(state){
    state.autocompleteList = []
  },
  UPDATE_AUTOCOMPLETE_INPUT(state, text){
    state.autocompleteInput = text;
  },
  SET_AUTOCOMPLETE_FOCUS(state, val){
    state.autocompleteIndex = val;
  },
  ADJUST_AUTOCOMPLETE_FOCUS(state, val){
    if(state.autocompleteIndex === ''){
      state.autocompleteIndex = 0
    }else{
      state.autocompleteIndex += val
      if(state.autocompleteIndex<0){
        state.autocompleteIndex = 0
      }else if(state.autocompleteIndex>0 && state.autocompleteIndex>state.autocompleteList.length-1){
        state.autocompleteIndex = state.autocompleteList.length-1
      }      
    }

  },
  RESET_AUTOCOMPLETE_FOCUS(state){
    state.autocompleteIndex = ''
  },
  UPDATE_AUTOCOMPLETE_FOCUS(state,val){
    state.inputFocus = val
  }

};

const actions = {
  initializeBooks({commit}){
    fetch('../../read/books.json').then(
      function(data){ 
        return data.json();}
    ).then(
      function(books){
          commit('INITIALIZE_BOOKS', books);
      }
    );
  },
  initializeChapters({commit}){
    fetch('../../read/chapters.json').then(
      function(data){ 
        return data.json();}
    ).then(
      function(chapters){
          commit('INITIALIZE_CHAPTERS', chapters);
      }
    );
  },
  searchData({commit, state}, q){
    var searchResult = bookSearch(state.books, q);
    commit('UPDATE_AUTOCOMPLETE_LIST', searchResult);
    commit('ADJUST_AUTOCOMPLETE_FOCUS', 0);    
  },
  optionPicked({commit}, selectedText){;
    commit('UPDATE_AUTOCOMPLETE_INPUT',selectedText);    
    commit('RESET_AUTOCOMPLETE');
    window.location.href = firstChapterLink(selectedText);
  },
  resetData({commit}){
    commit('RESET_AUTOCOMPLETE');
  },
  changeInput({commit},text){
    commit('UPDATE_AUTOCOMPLETE_INPUT',text);
  },
  focusChange({commit}, val){
    commit('ADJUST_AUTOCOMPLETE_FOCUS',val);
  },
  setFocus({commit}, val){
    commit('SET_AUTOCOMPLETE_FOCUS',val);
  },
  inputFocus({commit}, val){
    commit('UPDATE_AUTOCOMPLETE_FOCUS',val);
  }
};

const store = new Vuex.Store({
    state,
    mutations,
    actions
});

Vue.component('autocomplete',{
	template: '#autocomplete',
  created(){
    this.$store.dispatch('initializeBooks');
  },
  data(){
    return {}
  },
  computed : {
    autocompleteList () {
      if(this.isFocus){
        return this.$store.state.autocompleteList        
      }else{
        return []
      }
    },
    inputtext : {
      get () {
        return this.$store.state.autocompleteInput
      },
      set (value) {
        this.$store.dispatch('changeInput', value);      
      }
    },
    isFocus () {
      return this.$store.state.inputFocus
    }

  },
	methods: {
    fetchData: function(e){
      if(this.inputtext.length>=1 && this.isFocus){
        this.$store.dispatch('searchData', this.inputtext)
      }else{
        this.$store.dispatch('resetData')
      }
    },
    setFocus : function(e){
      var keycode = e.keyCode;
      var listLn = this.autocompleteList.length;
      
      if(listLn == 0)
        return;
      switch (keycode) {
          case 40: 
            this.$store.dispatch('focusChange',1);
            break;
          case 38: 
            this.$store.dispatch('focusChange',-1);
            break;
          case 13: 
            this.$store.dispatch('optionPicked', this.autocompleteList[this.$store.state.autocompleteIndex]);
            e.target.blur();
            //this.$store.dispatch('inputFocus',false);
            break;
          case 27: 
            e.target.blur();
            this.$store.dispatch('resetData');
            break;
        }
    },
    inputFocus : function(val){
      this.$store.dispatch('inputFocus',val);
    }
  },

});


Vue.component('list',{
	template: '#results-list',
  created : function(){
  },
  props : ['fetchedData'],
  methods: {
    selectMe : function(idx){
  this.$store.dispatch('optionPicked',this.fetchedData[idx]);
    },
    checkSelected : function(idx){
      return {
        'selected' : idx == this.$store.state.autocompleteIndex
      }
    },
    mouseHover : function(idx){
      this.$store.dispatch('setFocus',idx);
    }
  },
});

Vue.component('chapter-slideout', {
  template: '#chapter-slideout',
  created(){
    this.$store.dispatch('initializeChapters');
  },
  props: {
    book: {
      type: String
    }
  },
  data(){
    return {
      isOpen: false,
    }   
  },
  computed: {
    bookChapters() {
        let filter = this.book;
        return this.$store.state.chapters.filter(function(chapter){
            return chapter.name == filter;
        }).map(function(chapter){
            return {
                name: chapter.name + ' ' + chapter.number,
                link: '../' + chapter.link
            }
        });
    }
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }
});

new Vue({
	el: '#navigation',
  store
});