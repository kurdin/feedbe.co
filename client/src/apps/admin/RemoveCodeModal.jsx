import React from 'react';

import addClass from 'classnames';
import TextArea from '../../shared/textarea-autoresize';

const RemoveCodeForm = ({ code, on, elements }) => {
	return (
		<div class="columns is-vcentered">
			<div class="column">
				<div class="field is-clearfix m-0">
					<p class="control m-0">{!code.active && <span class="notActiveMessage">This Code is Deactivated</span>}</p>
				</div>
				<div class="field">
					<label class="label m-0">Name</label>
					<p class="control m-0">
						<input disabled class="input" type="text" value={code.name} />
					</p>
				</div>

				<div class="field">
					<label class="label m-0">Description</label>
					<p class="control m-0">
						<TextArea disabled className="input" value={code.description} />
					</p>
				</div>

				<div class="field">
					<label class="label m-0">Category</label>
					<p class="control m-0">
						<input disabled class="input" type="text" value={code.category} />
					</p>
				</div>

				<div class="field">
					<label class="label m-0">Tags</label>
					<p class="control m-0">
						<div class="react-select-popover">
							<div ignoreclass="ignore-onclickoutside" class="wrapOutSide">
								<div class="select-input">
									{code.tags && code.tags.map(tag => <span class="tag is-small is-info">{tag}</span>)}
								</div>
							</div>
						</div>
					</p>
				</div>

				<div class="field">
					<label class="label m-0">JavaScript ES6 Code</label>
					<div class="control m-0">
						<pre class="code cm-s-default nowrap" ref={el => (elements.removeCodeElement = el)}>
							<textarea class="rawcode">{code.code}</textarea>
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
};

const RemoveCodeModal = ({ code, on, elements, remove, error, removing, viewOnly }) => {
	console.log(code);
	return (
		<div class="modal is-active remove-code">
			<div class="modal-background" />
			<div class="modal-card">
				<header class="modal-card-head">
					{viewOnly ? (
						<p class="modal-card-title m-0">
							Viewing Code with id: <b>{code.id}</b>
						</p>
					) : (
						<p class="modal-card-title m-0 is-danger">
							Removing Code with id: <b>{code.id}</b>
						</p>
					)}
				</header>
				<section class="modal-card-body">
					<RemoveCodeForm code={code} on={on} elements={elements} />
					{error && (
						<p class="help is-danger m-0" key={error}>
							{error}{' '}
						</p>
					)}
				</section>
				<button class="modal-close" onClick={on.cancelCodeRemove} />
				{!viewOnly && (
					<footer class="modal-card-foot">
						{remove ? (
							<span>
								<b class="is-link">Sure?</b>{' '}
								<a class="button is-danger" onClick={on.removeCode}>
									YES, REMOVE
								</a>{' '}
								<a class="button is-link" onClick={on.removeCancelCode}>
									NO, CANCEL
								</a>
							</span>
						) : (
							<span>
								<a class={addClass({ 'is-loading': removing }, 'button is-danger')} onClick={on.removeCode}>
									REMOVE THIS CODE
								</a>
								<a class="button is-link" onClick={on.cancelCodeRemove}>
									Cancel
								</a>
							</span>
						)}
					</footer>
				)}
				{viewOnly && (
					<footer class="modal-card-foot">
						<a class="button" onClick={on.editCode(code.id)}>
							EDIT CODE
						</a>
						<a class="button is-right" style={{ 'margin-left': 'auto' }} onClick={on.cancelCodeRemove}>
							CLOSE MODAL
						</a>
					</footer>
				)}
			</div>
		</div>
	);
};

export default RemoveCodeModal;
