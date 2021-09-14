
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.5' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.42.5 */

    const file$3 = "src/components/Header.svelte";

    function create_fragment$3(ctx) {
    	let div8;
    	let div1;
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let div6;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let p2;
    	let t6;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t7;
    	let p3;
    	let t9;
    	let div4;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let p4;
    	let t12;
    	let div5;
    	let img3;
    	let img3_src_value;
    	let t13;
    	let p5;
    	let a;
    	let t15;
    	let div7;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "PATRICK STOEBENAU";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Software & Web Developer";
    			t3 = space();
    			div6 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t4 = space();
    			p2 = element("p");
    			p2.textContent = "Orlando, FL";
    			t6 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "pstoebenau@knights.ucf.edu";
    			t9 = space();
    			div4 = element("div");
    			img2 = element("img");
    			t10 = space();
    			p4 = element("p");
    			p4.textContent = "(407) 406-7925";
    			t12 = space();
    			div5 = element("div");
    			img3 = element("img");
    			t13 = space();
    			p5 = element("p");
    			a = element("a");
    			a.textContent = "github.com/pstoebenau";
    			t15 = space();
    			div7 = element("div");
    			attr_dev(p0, "id", "name");
    			attr_dev(p0, "class", "svelte-11uxr4x");
    			add_location(p0, file$3, 5, 6, 93);
    			attr_dev(p1, "id", "description");
    			attr_dev(p1, "class", "svelte-11uxr4x");
    			add_location(p1, file$3, 6, 6, 134);
    			add_location(div0, file$3, 4, 4, 81);
    			attr_dev(div1, "id", "name-description");
    			attr_dev(div1, "class", "svelte-11uxr4x");
    			add_location(div1, file$3, 3, 2, 49);
    			if (!src_url_equal(img0.src, img0_src_value = "./images/location.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "location");
    			attr_dev(img0, "class", "svelte-11uxr4x");
    			add_location(img0, file$3, 11, 6, 270);
    			attr_dev(p2, "class", "svelte-11uxr4x");
    			add_location(p2, file$3, 12, 6, 325);
    			attr_dev(div2, "class", "icon-description svelte-11uxr4x");
    			add_location(div2, file$3, 10, 4, 233);
    			if (!src_url_equal(img1.src, img1_src_value = "./images/email.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "email");
    			attr_dev(img1, "class", "svelte-11uxr4x");
    			add_location(img1, file$3, 15, 6, 396);
    			attr_dev(p3, "class", "svelte-11uxr4x");
    			add_location(p3, file$3, 16, 6, 445);
    			attr_dev(div3, "class", "icon-description svelte-11uxr4x");
    			add_location(div3, file$3, 14, 4, 359);
    			if (!src_url_equal(img2.src, img2_src_value = "./images/phone.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "phone");
    			attr_dev(img2, "class", "svelte-11uxr4x");
    			add_location(img2, file$3, 19, 6, 531);
    			attr_dev(p4, "class", "svelte-11uxr4x");
    			add_location(p4, file$3, 20, 6, 580);
    			attr_dev(div4, "class", "icon-description svelte-11uxr4x");
    			add_location(div4, file$3, 18, 4, 494);
    			if (!src_url_equal(img3.src, img3_src_value = "./images/github.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "github");
    			attr_dev(img3, "class", "svelte-11uxr4x");
    			add_location(img3, file$3, 23, 6, 654);
    			attr_dev(a, "href", "https://github.com/pstoebenau");
    			add_location(a, file$3, 24, 9, 708);
    			attr_dev(p5, "class", "svelte-11uxr4x");
    			add_location(p5, file$3, 24, 6, 705);
    			attr_dev(div5, "class", "icon-description svelte-11uxr4x");
    			add_location(div5, file$3, 22, 4, 617);
    			attr_dev(div6, "id", "contact-info");
    			attr_dev(div6, "class", "svelte-11uxr4x");
    			add_location(div6, file$3, 9, 2, 205);
    			attr_dev(div7, "class", "dotted-line svelte-11uxr4x");
    			add_location(div7, file$3, 27, 2, 800);
    			attr_dev(div8, "id", "header");
    			attr_dev(div8, "class", "svelte-11uxr4x");
    			add_location(div8, file$3, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(div8, t3);
    			append_dev(div8, div6);
    			append_dev(div6, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t4);
    			append_dev(div2, p2);
    			append_dev(div6, t6);
    			append_dev(div6, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t7);
    			append_dev(div3, p3);
    			append_dev(div6, t9);
    			append_dev(div6, div4);
    			append_dev(div4, img2);
    			append_dev(div4, t10);
    			append_dev(div4, p4);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, img3);
    			append_dev(div5, t13);
    			append_dev(div5, p5);
    			append_dev(p5, a);
    			append_dev(div8, t15);
    			append_dev(div8, div7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var data = { Objective:"Skilled developer in web development and Java and Python development that can easily adapt to different workflows. Passionate about clean and reusable code.",
      Skills:{ "Programming Languages":"HTML, CSS. JavaScript, MySQL, PHP, TypeScript, Java, Python, C, Dart",
        "Web Frameworks":"Angular.js, React.js, Vue.js, Svelte, React Native, Flutter",
        "Web Technologies":"Express.js, Socket.io, Tensorflow",
        Software:"Git, GitHub, Linux, Unix, Unity3D, Unreal Engine, Blender",
        Languages:"English (Native)<br>German (Intermediate)<br>Spanish (Basic)" },
      Honors:[ "Bright Futures, Academic Scholar",
        "UCF Dean's List" ],
      "Personal Project":[ { name:"BicBacBoe",
          url:"https://github.com/pstoebenau/BicBacBoe" },
        { name:"Polynomial Regression Neural Network",
          url:"https://github.com/pstoebenau/Polynomial_Regression_AI" },
        { name:"4D Visualization",
          url:"https://github.com/pstoebenau/4D-Visualization" },
        { name:"Resume",
          url:"https://github.com/pstoebenau/Resume" },
        { name:"Neural Network",
          url:"https://github.com/pstoebenau/NeuralNetwork" } ],
      Education:{ college:"University of Central Florida",
        location:"Orlando, FL",
        degree:"Bachelors of Science in Computer Science",
        gradDate:"Apr 2022",
        gpa:3.64 },
      Experience:[ { name:"Amazing Voice",
          url:"https://amazingvoice.com",
          location:"Orlando, FL",
          role:"Full Stack Web",
          dateRange:"March 2021 - Present",
          description:[ "Maintain admin panel and main website",
            "Use PHP and tech like Bootstrap, Font Awesome, and jQuery",
            "Created custom blog generator that saves a day for each blog" ] },
        { name:"Chill Chili",
          url:"https://chillchili.ml",
          location:"Orlando, Fl",
          role:"Full Stack Web & App Developer",
          dateRange:"March 2021 - April 2021",
          description:[ "Flutter application for iOS, Android, and Web",
            "MongoDB, Node.js, and Typescript for REST API" ] },
        { name:"KnightHacks Development Team",
          url:"https://knighthacks.org",
          location:"Orlando, FL",
          role:"Full Stack Web & iOS Developer",
          dateRange:"Apr 2019 - August 2020",
          description:[ "Created KnightHacks website for club events",
            "Uses Azure functions and Node.js with Google Calendar",
            "Uses Swift 5 in Xcode with a backend in Node.js" ] },
        { name:"Crown Heritage Law",
          url:"https://crownheritagelaw.com",
          location:"Orlando, FL",
          role:"Web Developer & Project Manager",
          dateRange:"Aug 2020 - Dec 2020",
          description:[ "Lead development team in a AGILE work environment",
            "Uses Vue.js as framework" ] } ],
      Hobbies:[ { name:"3D Printing",
          description:[ "Custom Merlin software",
            "Raspberry Pi server for remote access using Octoprint" ] },
        { name:"FPV Drone",
          description:[ "Built Racing drone",
            "Top speed is around 80mph",
            "Transmits analog video to FPV headset" ] } ],
      Coursework:[ "Computer Science II",
        "Discrete Computational Structures",
        "Systems Software",
        "Object Oriented Programming",
        "Computer Logic & Organization",
        "Security in Computing" ],
      "Campus Involvement":[ { name:"KnightHacks",
          role:"Developer",
          dateRange:"Jan 2019 - Present" },
        { name:"Hack@UCF",
          role:"Member",
          dateRange:"Aug 2018 - Present" },
        { name:"FPV Knights",
          role:"Member",
          dateRange:"Jan 2019 - Present" } ] };
    data.Objective;
    data.Skills;
    data.Honors;
    data.Education;
    data.Experience;
    data.Hobbies;
    data.Coursework;

    /* src/components/SideSection.svelte generated by Svelte v3.42.5 */

    const { Object: Object_1 } = globals;
    const file$2 = "src/components/SideSection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (13:4) {#each Object.entries(data.Skills) as skill}
    function create_each_block_2$1(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*skill*/ ctx[6][0] + "";
    	let t0;
    	let t1;
    	let p1;
    	let raw_value = /*skill*/ ctx[6][1] + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			add_location(p0, file$2, 14, 6, 342);
    			attr_dev(div, "class", "section-title svelte-8kfxsq");
    			add_location(div, file$2, 13, 4, 308);
    			attr_dev(p1, "class", "skill-list");
    			add_location(p1, file$2, 16, 4, 375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			p1.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(13:4) {#each Object.entries(data.Skills) as skill}",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#each data["Personal Project"] as project}
    function create_each_block_1$1(ctx) {
    	let a;
    	let p;
    	let b;
    	let t0_value = /*project*/ ctx[3]['name'] + "";
    	let t0;
    	let i;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;

    	const block = {
    		c: function create() {
    			a = element("a");
    			p = element("p");
    			b = element("b");
    			t0 = text(t0_value);
    			i = element("i");
    			i.textContent = ", Github";
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			add_location(b, file$2, 28, 10, 695);
    			add_location(i, file$2, 28, 34, 719);
    			if (!src_url_equal(img.src, img_src_value = "./images/link.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "link");
    			attr_dev(img, "class", "svelte-8kfxsq");
    			add_location(img, file$2, 29, 10, 745);
    			attr_dev(p, "class", "svelte-8kfxsq");
    			add_location(p, file$2, 27, 8, 681);
    			attr_dev(a, "href", /*project*/ ctx[3]['url']);
    			add_location(a, file$2, 26, 6, 647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, p);
    			append_dev(p, b);
    			append_dev(b, t0);
    			append_dev(p, i);
    			append_dev(p, t2);
    			append_dev(p, img);
    			append_dev(a, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(26:6) {#each data[\\\"Personal Project\\\"] as project}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#each data["Honors"] as award}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*award*/ ctx[0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$2, 41, 7, 995);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(41:4) {#each data[\\\"Honors\\\"] as award}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div9;
    	let div1;
    	let div0;
    	let t1;
    	let p0;
    	let t3;
    	let div3;
    	let div2;
    	let p1;
    	let t5;
    	let t6;
    	let div6;
    	let div4;
    	let p2;
    	let t8;
    	let div5;
    	let t9;
    	let div8;
    	let div7;
    	let p3;
    	let t11;
    	let each_value_2 = Object.entries(data.Skills);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = data["Personal Project"];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = data["Honors"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "OBJECTIVE";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = `${data.Objective}`;
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "SKILLS";
    			t5 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t6 = space();
    			div6 = element("div");
    			div4 = element("div");
    			p2 = element("p");
    			p2.textContent = "PERSONAL PROJECTS";
    			t8 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div8 = element("div");
    			div7 = element("div");
    			p3 = element("p");
    			p3.textContent = "HONORS";
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "section-header svelte-8kfxsq");
    			add_location(div0, file$2, 2, 4, 54);
    			attr_dev(p0, "class", "svelte-8kfxsq");
    			add_location(p0, file$2, 5, 4, 114);
    			attr_dev(div1, "class", "side-section svelte-8kfxsq");
    			attr_dev(div1, "id", "objective");
    			add_location(div1, file$2, 1, 2, 8);
    			add_location(p1, file$2, 10, 6, 230);
    			attr_dev(div2, "class", "section-header svelte-8kfxsq");
    			add_location(div2, file$2, 9, 4, 195);
    			attr_dev(div3, "class", "side-section svelte-8kfxsq");
    			attr_dev(div3, "id", "skills");
    			add_location(div3, file$2, 8, 2, 152);
    			add_location(p2, file$2, 22, 6, 524);
    			attr_dev(div4, "class", "section-header svelte-8kfxsq");
    			add_location(div4, file$2, 21, 4, 489);
    			attr_dev(div5, "class", "project-list svelte-8kfxsq");
    			add_location(div5, file$2, 24, 4, 564);
    			attr_dev(div6, "class", "side-section svelte-8kfxsq");
    			attr_dev(div6, "id", "projects");
    			add_location(div6, file$2, 20, 2, 444);
    			add_location(p3, file$2, 38, 6, 927);
    			attr_dev(div7, "class", "section-header svelte-8kfxsq");
    			add_location(div7, file$2, 37, 4, 892);
    			attr_dev(div8, "class", "side-section svelte-8kfxsq");
    			attr_dev(div8, "id", "honors");
    			add_location(div8, file$2, 36, 2, 849);
    			add_location(div9, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(div9, t3);
    			append_dev(div9, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(div3, t5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div3, null);
    			}

    			append_dev(div9, t6);
    			append_dev(div9, div6);
    			append_dev(div6, div4);
    			append_dev(div4, p2);
    			append_dev(div6, t8);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div5, null);
    			}

    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, p3);
    			append_dev(div8, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, data*/ 0) {
    				each_value_2 = Object.entries(data.Skills);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*data*/ 0) {
    				each_value_1 = data["Personal Project"];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*data*/ 0) {
    				each_value = data["Honors"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SideSection', slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SideSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data });
    	return [];
    }

    class SideSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideSection",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/MainSection.svelte generated by Svelte v3.42.5 */
    const file$1 = "src/components/MainSection.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (51:10) {#each experience.description as str}
    function create_each_block_4(ctx) {
    	let li;
    	let t_value = /*str*/ ctx[10] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$1, 51, 12, 1640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(51:10) {#each experience.description as str}",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#each experiences as experience}
    function create_each_block_3(ctx) {
    	let div0;
    	let a;
    	let p0;
    	let t0_value = /*experience*/ ctx[13].name + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let p1;
    	let t3_value = /*experience*/ ctx[13].location + "";
    	let t3;
    	let t4;
    	let div1;
    	let i;
    	let t5_value = /*experience*/ ctx[13].role + "";
    	let t5;
    	let t6;
    	let p2;
    	let t7_value = /*experience*/ ctx[13].dateRange + "";
    	let t7;
    	let t8;
    	let ul;
    	let t9;
    	let each_value_4 = /*experience*/ ctx[13].description;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a = element("a");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			i = element("i");
    			t5 = text(t5_value);
    			t6 = space();
    			p2 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			attr_dev(img, "class", "inline-icon svelte-1v9nx91");
    			if (!src_url_equal(img.src, img_src_value = "./images/link.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "link");
    			add_location(img, file$1, 40, 14, 1293);
    			attr_dev(p0, "class", "section-title svelte-1v9nx91");
    			add_location(p0, file$1, 38, 12, 1221);
    			attr_dev(a, "href", /*experience*/ ctx[13].url);
    			attr_dev(a, "target", "blank");
    			add_location(a, file$1, 37, 10, 1168);
    			add_location(p1, file$1, 43, 10, 1396);
    			attr_dev(div0, "class", "line-container svelte-1v9nx91");
    			add_location(div0, file$1, 36, 8, 1129);
    			add_location(i, file$1, 46, 10, 1487);
    			add_location(p2, file$1, 47, 10, 1522);
    			attr_dev(div1, "class", "line-container svelte-1v9nx91");
    			add_location(div1, file$1, 45, 8, 1448);
    			attr_dev(ul, "class", "svelte-1v9nx91");
    			add_location(ul, file$1, 49, 8, 1575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a);
    			append_dev(a, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, img);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    			append_dev(i, t5);
    			append_dev(div1, t6);
    			append_dev(div1, p2);
    			append_dev(p2, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*experiences*/ 1) {
    				each_value_4 = /*experience*/ ctx[13].description;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t9);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(36:6) {#each experiences as experience}",
    		ctx
    	});

    	return block;
    }

    // (75:14) {#each hobby.description as str}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*str*/ ctx[10] + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			add_location(li, file$1, 75, 16, 2296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(75:14) {#each hobby.description as str}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#each hobbies as hobby}
    function create_each_block_1(ctx) {
    	let div;
    	let p;
    	let t0_value = /*hobby*/ ctx[7].name + "";
    	let t0;
    	let t1;
    	let ul;
    	let t2;
    	let each_value_2 = /*hobby*/ ctx[7].description;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(p, "class", "section-title svelte-1v9nx91");
    			add_location(p, file$1, 72, 12, 2174);
    			attr_dev(ul, "class", "svelte-1v9nx91");
    			add_location(ul, file$1, 73, 12, 2228);
    			attr_dev(div, "class", "hobby svelte-1v9nx91");
    			add_location(div, file$1, 71, 10, 2142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hobbies*/ 2) {
    				each_value_2 = /*hobby*/ ctx[7].description;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(71:8) {#each hobbies as hobby}",
    		ctx
    	});

    	return block;
    }

    // (115:6) {#each clubs as club}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t0_value = /*club*/ ctx[4].name + "";
    	let t0;
    	let t1;
    	let i;
    	let t2;
    	let t3_value = /*club*/ ctx[4].role + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5_value = /*club*/ ctx[4].dateRange + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			i = element("i");
    			t2 = text(", ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(p0, "class", "section-title svelte-1v9nx91");
    			add_location(p0, file$1, 117, 12, 3420);
    			add_location(i, file$1, 118, 12, 3473);
    			set_style(div0, "display", "flex");
    			add_location(div0, file$1, 116, 10, 3380);
    			add_location(p1, file$1, 120, 10, 3521);
    			attr_dev(div1, "class", "line-container svelte-1v9nx91");
    			add_location(div1, file$1, 115, 8, 3341);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, i);
    			append_dev(i, t2);
    			append_dev(i, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(div1, t6);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(115:6) {#each clubs as club}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div31;
    	let div8;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div7;
    	let div4;
    	let p0;
    	let t3;
    	let div2;
    	let t4;
    	let div3;
    	let t5;
    	let div5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let div6;
    	let p3;
    	let t11;
    	let p4;
    	let t13;
    	let p5;
    	let t16;
    	let div15;
    	let div10;
    	let img1;
    	let img1_src_value;
    	let t17;
    	let div9;
    	let t18;
    	let div14;
    	let div13;
    	let p6;
    	let t20;
    	let div11;
    	let t21;
    	let div12;
    	let t22;
    	let t23;
    	let div23;
    	let div17;
    	let img2;
    	let img2_src_value;
    	let t24;
    	let div16;
    	let t25;
    	let div22;
    	let div20;
    	let p7;
    	let t27;
    	let div18;
    	let t28;
    	let div19;
    	let t29;
    	let div21;
    	let t30;
    	let div30;
    	let div25;
    	let img3;
    	let img3_src_value;
    	let t31;
    	let div24;
    	let t32;
    	let div29;
    	let div28;
    	let p8;
    	let t34;
    	let div26;
    	let t35;
    	let div27;
    	let t36;
    	let each_value_3 = /*experiences*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = /*hobbies*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*clubs*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div31 = element("div");
    			div8 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div7 = element("div");
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "EDUCATION";
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div3 = element("div");
    			t5 = space();
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = `${data.Education.college}`;
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = `${data.Education.location}`;
    			t9 = space();
    			div6 = element("div");
    			p3 = element("p");
    			p3.textContent = `${data.Education.degree}`;
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = `${data.Education.gradDate}`;
    			t13 = space();
    			p5 = element("p");
    			p5.textContent = `GPA: ${data.Education.gpa}`;
    			t16 = space();
    			div15 = element("div");
    			div10 = element("div");
    			img1 = element("img");
    			t17 = space();
    			div9 = element("div");
    			t18 = space();
    			div14 = element("div");
    			div13 = element("div");
    			p6 = element("p");
    			p6.textContent = "PROFESSIONAL EXPERIENCE";
    			t20 = space();
    			div11 = element("div");
    			t21 = space();
    			div12 = element("div");
    			t22 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t23 = space();
    			div23 = element("div");
    			div17 = element("div");
    			img2 = element("img");
    			t24 = space();
    			div16 = element("div");
    			t25 = space();
    			div22 = element("div");
    			div20 = element("div");
    			p7 = element("p");
    			p7.textContent = "HOBBIES";
    			t27 = space();
    			div18 = element("div");
    			t28 = space();
    			div19 = element("div");
    			t29 = space();
    			div21 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t30 = space();
    			div30 = element("div");
    			div25 = element("div");
    			img3 = element("img");
    			t31 = space();
    			div24 = element("div");
    			t32 = space();
    			div29 = element("div");
    			div28 = element("div");
    			p8 = element("p");
    			p8.textContent = "CAMPUS INVOLVEMENT";
    			t34 = space();
    			div26 = element("div");
    			t35 = space();
    			div27 = element("div");
    			t36 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (!src_url_equal(img0.src, img0_src_value = "./images/university.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "team");
    			attr_dev(img0, "class", "svelte-1v9nx91");
    			add_location(img0, file$1, 3, 6, 85);
    			attr_dev(div0, "class", "vertical-line svelte-1v9nx91");
    			add_location(div0, file$1, 4, 6, 138);
    			attr_dev(div1, "class", "section-divider svelte-1v9nx91");
    			add_location(div1, file$1, 2, 4, 49);
    			add_location(p0, file$1, 8, 8, 260);
    			attr_dev(div2, "class", "dot svelte-1v9nx91");
    			add_location(div2, file$1, 9, 8, 285);
    			attr_dev(div3, "class", "line svelte-1v9nx91");
    			add_location(div3, file$1, 10, 8, 317);
    			attr_dev(div4, "class", "section-header svelte-1v9nx91");
    			add_location(div4, file$1, 7, 6, 223);
    			attr_dev(p1, "class", "section-title svelte-1v9nx91");
    			add_location(p1, file$1, 13, 8, 398);
    			add_location(p2, file$1, 14, 8, 460);
    			attr_dev(div5, "class", "line-container svelte-1v9nx91");
    			add_location(div5, file$1, 12, 6, 361);
    			set_style(p3, "font-style", "italic");
    			add_location(p3, file$1, 17, 8, 549);
    			add_location(p4, file$1, 18, 8, 615);
    			attr_dev(div6, "class", "line-container svelte-1v9nx91");
    			add_location(div6, file$1, 16, 6, 512);
    			add_location(p5, file$1, 20, 6, 667);
    			attr_dev(div7, "class", "section-content svelte-1v9nx91");
    			add_location(div7, file$1, 6, 4, 187);
    			attr_dev(div8, "class", "section svelte-1v9nx91");
    			attr_dev(div8, "id", "education");
    			add_location(div8, file$1, 1, 2, 8);
    			if (!src_url_equal(img1.src, img1_src_value = "./images/edit.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "team");
    			attr_dev(img1, "class", "svelte-1v9nx91");
    			add_location(img1, file$1, 26, 6, 803);
    			attr_dev(div9, "class", "vertical-line svelte-1v9nx91");
    			add_location(div9, file$1, 27, 6, 850);
    			attr_dev(div10, "class", "section-divider svelte-1v9nx91");
    			add_location(div10, file$1, 25, 4, 767);
    			add_location(p6, file$1, 31, 8, 972);
    			attr_dev(div11, "class", "dot svelte-1v9nx91");
    			add_location(div11, file$1, 32, 8, 1011);
    			attr_dev(div12, "class", "line svelte-1v9nx91");
    			add_location(div12, file$1, 33, 8, 1043);
    			attr_dev(div13, "class", "section-header svelte-1v9nx91");
    			add_location(div13, file$1, 30, 6, 935);
    			attr_dev(div14, "class", "section-content svelte-1v9nx91");
    			add_location(div14, file$1, 29, 4, 899);
    			attr_dev(div15, "class", "section svelte-1v9nx91");
    			attr_dev(div15, "id", "experience");
    			add_location(div15, file$1, 24, 2, 725);
    			if (!src_url_equal(img2.src, img2_src_value = "./images/hobby.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "team");
    			attr_dev(img2, "class", "svelte-1v9nx91");
    			add_location(img2, file$1, 60, 6, 1801);
    			attr_dev(div16, "class", "vertical-line svelte-1v9nx91");
    			add_location(div16, file$1, 61, 6, 1849);
    			attr_dev(div17, "class", "section-divider svelte-1v9nx91");
    			add_location(div17, file$1, 59, 4, 1765);
    			add_location(p7, file$1, 65, 8, 1971);
    			attr_dev(div18, "class", "dot svelte-1v9nx91");
    			add_location(div18, file$1, 66, 8, 1994);
    			attr_dev(div19, "class", "line svelte-1v9nx91");
    			add_location(div19, file$1, 67, 8, 2026);
    			attr_dev(div20, "class", "section-header svelte-1v9nx91");
    			add_location(div20, file$1, 64, 6, 1934);
    			attr_dev(div21, "class", "line-container svelte-1v9nx91");
    			add_location(div21, file$1, 69, 6, 2070);
    			attr_dev(div22, "class", "section-content svelte-1v9nx91");
    			add_location(div22, file$1, 63, 4, 1898);
    			attr_dev(div23, "class", "section svelte-1v9nx91");
    			attr_dev(div23, "id", "hobbies");
    			add_location(div23, file$1, 58, 2, 1726);
    			if (!src_url_equal(img3.src, img3_src_value = "./images/team.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "team");
    			attr_dev(img3, "class", "svelte-1v9nx91");
    			add_location(img3, file$1, 105, 6, 3032);
    			attr_dev(div24, "class", "vertical-line svelte-1v9nx91");
    			add_location(div24, file$1, 106, 6, 3079);
    			attr_dev(div25, "class", "section-divider svelte-1v9nx91");
    			add_location(div25, file$1, 104, 4, 2996);
    			add_location(p8, file$1, 110, 8, 3201);
    			attr_dev(div26, "class", "dot svelte-1v9nx91");
    			add_location(div26, file$1, 111, 8, 3235);
    			attr_dev(div27, "class", "line svelte-1v9nx91");
    			add_location(div27, file$1, 112, 8, 3267);
    			attr_dev(div28, "class", "section-header svelte-1v9nx91");
    			add_location(div28, file$1, 109, 6, 3164);
    			attr_dev(div29, "class", "section-content svelte-1v9nx91");
    			add_location(div29, file$1, 108, 4, 3128);
    			attr_dev(div30, "class", "section svelte-1v9nx91");
    			attr_dev(div30, "id", "campus-involvement");
    			add_location(div30, file$1, 103, 2, 2946);
    			add_location(div31, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div31, anchor);
    			append_dev(div31, div8);
    			append_dev(div8, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div8, t1);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div7, t5);
    			append_dev(div7, div5);
    			append_dev(div5, p1);
    			append_dev(div5, t7);
    			append_dev(div5, p2);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div6, p3);
    			append_dev(div6, t11);
    			append_dev(div6, p4);
    			append_dev(div7, t13);
    			append_dev(div7, p5);
    			append_dev(div31, t16);
    			append_dev(div31, div15);
    			append_dev(div15, div10);
    			append_dev(div10, img1);
    			append_dev(div10, t17);
    			append_dev(div10, div9);
    			append_dev(div15, t18);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, p6);
    			append_dev(div13, t20);
    			append_dev(div13, div11);
    			append_dev(div13, t21);
    			append_dev(div13, div12);
    			append_dev(div14, t22);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div14, null);
    			}

    			append_dev(div31, t23);
    			append_dev(div31, div23);
    			append_dev(div23, div17);
    			append_dev(div17, img2);
    			append_dev(div17, t24);
    			append_dev(div17, div16);
    			append_dev(div23, t25);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div20, p7);
    			append_dev(div20, t27);
    			append_dev(div20, div18);
    			append_dev(div20, t28);
    			append_dev(div20, div19);
    			append_dev(div22, t29);
    			append_dev(div22, div21);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div21, null);
    			}

    			append_dev(div31, t30);
    			append_dev(div31, div30);
    			append_dev(div30, div25);
    			append_dev(div25, img3);
    			append_dev(div25, t31);
    			append_dev(div25, div24);
    			append_dev(div30, t32);
    			append_dev(div30, div29);
    			append_dev(div29, div28);
    			append_dev(div28, p8);
    			append_dev(div28, t34);
    			append_dev(div28, div26);
    			append_dev(div28, t35);
    			append_dev(div28, div27);
    			append_dev(div29, t36);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div29, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*experiences*/ 1) {
    				each_value_3 = /*experiences*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div14, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty & /*hobbies*/ 2) {
    				each_value_1 = /*hobbies*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div21, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*clubs*/ 4) {
    				each_value = /*clubs*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div29, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div31);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainSection', slots, []);
    	const experiences = data["Experience"];
    	const hobbies = data["Hobbies"];
    	const coursework = data["Coursework"];
    	const clubs = data["Campus Involvement"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		data,
    		experiences,
    		hobbies,
    		coursework,
    		clubs
    	});

    	return [experiences, hobbies, clubs];
    }

    class MainSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainSection",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.5 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let header;
    	let t0;
    	let div0;
    	let sidesection;
    	let t1;
    	let mainsection;
    	let current;
    	header = new Header({ $$inline: true });
    	sidesection = new SideSection({ $$inline: true });
    	mainsection = new MainSection({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(sidesection.$$.fragment);
    			t1 = space();
    			create_component(mainsection.$$.fragment);
    			attr_dev(div0, "id", "grid-container");
    			attr_dev(div0, "class", "svelte-1cnj84h");
    			add_location(div0, file, 4, 6, 91);
    			attr_dev(div1, "id", "margin");
    			attr_dev(div1, "class", "svelte-1cnj84h");
    			add_location(div1, file, 2, 4, 43);
    			attr_dev(div2, "id", "page");
    			attr_dev(div2, "class", "svelte-1cnj84h");
    			add_location(div2, file, 1, 2, 23);
    			attr_dev(div3, "id", "container");
    			attr_dev(div3, "class", "svelte-1cnj84h");
    			add_location(div3, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(header, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(sidesection, div0, null);
    			append_dev(div0, t1);
    			mount_component(mainsection, div0, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(sidesection.$$.fragment, local);
    			transition_in(mainsection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(sidesection.$$.fragment, local);
    			transition_out(mainsection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(header);
    			destroy_component(sidesection);
    			destroy_component(mainsection);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, SideSection, MainSection });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'App'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
