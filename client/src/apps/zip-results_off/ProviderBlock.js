import Truncate from 'shared/TruncateByLines';

const ProviderBlock = ({ example, on, copied }) => {
	return (
		<div class="column is-12">
			<div class="card">
				<header class="card-header" onClick={on.view(example.id)}>
					<p class="card-header-title">
						<Truncate lines={1} dangerouslySetInnerHTML={{ __html: example.name }} />
					</p>
					<span
						class="card-header-icon timestamp hint--flex hint--timeout hint--bottom-left"
						onClick={on.run(example.code, example.id)}
						aria-label="Run"
					>
						<span class="icon-right-dir" />
					</span>
				</header>
				<div class="card-code" title="Expand Code" onClick={on.view(example.id)}>
					{copied !== example.id ? (
						<a
							class="button is-small copyButton"
							title="to Clipboard"
							onClick={on.copy(example.code, example.id)}
						>
							<span>COPY</span>
						</a>
					) : (
						<a
							class="button is-small is-success copyButton"
							title="to Clipboard"
							onClick={on.copy(example.code, example.id)}
						>
							<span>
								<b>COPIED!</b>
							</span>
						</a>
					)}
				</div>
				<div class="card-content p-075" onClick={on.view(example.id)}>
					<div class="example-description">
						<Truncate lines={3} dangerouslySetInnerHTML={{ __html: example.description }} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProviderBlock;
