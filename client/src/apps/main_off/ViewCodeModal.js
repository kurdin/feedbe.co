// import addClass from 'classnames';

const ViewCodeCard = ({ code, on, elements, copied, oncopy }) => {
  return (
    <div class="control m-0">
      {copied !== code.id ? (
        <a
          class="button is-small copyButton"
          title="to Clipboard"
          onClick={oncopy(code.code, code.id)}
        >
          <span>COPY</span>
        </a>
      ) : (
        <a
          class="button is-small is-success copyButton"
          title="to Clipboard"
          onClick={oncopy(code.code, code.id)}
        >
          <span>
            <b>COPIED!</b>
          </span>
        </a>
      )}
      <pre class="code cm-s-default nowrap" ref={el => (elements.viewCodeElement = el)} />
    </div>
  );
};

const ViewCodeModal = ({ code, on, elements, run, copied, oncopy }) => (
  <div class="modal is-active view-code is-large">
    <div class="modal-background" onClick={on.cancelCodeRemove} />
    <div class="modal-card">
      <nav class="modal-card-top-title m-0">
        <h1 class="title is-pulled-left">{code.name}</h1>
        <a
          href={'/' + code.id}
          class="run-on-card is-pulled-right"
          onClick={on.run(code.code, code.id)}
        >
          RUN <span class="icon-right-dir" />
        </a>
      </nav>
      <section class="modal-card-body p-0">
        <ViewCodeCard code={code} on={on} copied={copied} oncopy={oncopy} elements={elements} />
      </section>
      {/*
    <footer class="modal-card-foot">
        <a class="button">EDIT CODE</a>
        <a class="button is-right" style={{ 'margin-left': 'auto' }} onClick={ on.cancelCodeRemove }>CLOSE</a>
    </footer>
    */}
      <div class="modal-card-top-title">
        <h3 class="subtitle">
          <span dangerouslySetInnerHTML={{ __html: code.description }} />
        </h3>
      </div>
      <nav class="level">
        <div class="level-left m-0">
          <div class="columns-tags">
            {code.tags.map(tag => (
              <a href={'/tag/' + slugify(tag)} onClick={on.selectTag(tag)} class="tag is-info">
                {tag}
              </a>
            ))}
          </div>
        </div>
        <div class="level-right m-0">
          <div class="columns-cats">
            <a
              href={'/cat/' + slugify(code.category)}
              onClick={on.selectCat(code.category)}
              class="cat tag is-small is-dark"
            >
              in: {code.category}
            </a>
          </div>
        </div>
      </nav>
    </div>
    <button class="modal-close" onClick={on.cancelCodeRemove} />
  </div>
);

export default ViewCodeModal;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
